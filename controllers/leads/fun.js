import { leadModel } from "../../models/connection.model.js";

import { userModel } from "../../models/user.model.js";

import jwt from "jsonwebtoken";

import crypto from "crypto";

import parsePhoneNumber from "libphonenumber-js";

import { adminNClientARLead } from "../../utils/email/lead.email.js";

import {
  getContactByEmail,
  writeContact,
} from "../../utils/leads/write.contact.js";

import { writeDeal } from "../../utils/leads/write.deal.js";

// Deterministic but secret userId from email

const generateUserId = (email) => {
  return crypto

    .createHmac("sha256", process.env.USER_ID_SECRET)

    .update(email.toLowerCase().trim())

    .digest("hex")

    .slice(0, 24);
};
export const leadGeneration = async (req, res) => {
  try {
    const { name, email, phoneNumber, message, serviceTypes } = req.body;

    // =========================================================
    // 1. BASIC VALIDATION
    // =========================================================

    if (!name || !email || !phoneNumber || !message || !serviceTypes) {
      console.log("Validation failed:", {
        name,
        email,
        phoneNumber,
        message,
        serviceTypes,
      });

      return res.status(400).json({
        success: false,
        message: "Missing required fields! Fill all the fields and try again.",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();

    if (!trimmedName || !normalizedEmail || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message cannot be empty.",
      });
    }

    // =========================================================
    // 2. NORMALIZE SERVICE TYPES
    // =========================================================

    const normalizedServiceTypes = Array.isArray(serviceTypes)
      ? serviceTypes.map((service) => String(service).trim()).filter(Boolean)
      : [String(serviceTypes).trim()].filter(Boolean);

    if (normalizedServiceTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one service.",
      });
    }

    // =========================================================
    // 3. PHONE VALIDATION + FORMATTING
    // =========================================================

    const phone = parsePhoneNumber(phoneNumber);

    if (!phone || !phone.isValid()) {
      console.log("Invalid phone number:", phoneNumber);

      return res.status(400).json({
        success: false,
        message: "Invalid phone number! Please provide a valid phone number.",
      });
    }

    const phoneData = {
      country: phone.country,
      countryCode: `+${phone.countryCallingCode}`,
      number: phone.nationalNumber,
      fullNumber: phone.number,
    };

    // =========================================================
    // 4. SPLIT NAME
    // =========================================================

    const nameParts = trimmedName.split(/\s+/);

    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // =========================================================
    // 5. RESOLVE USER
    // =========================================================

    const userToken = req.cookies["user_token"];

    let userId = null;
    let user = null;
    let newToken = null;

    // ---------------------------------------------------------
    // Try existing JWT first
    // ---------------------------------------------------------

    if (userToken) {
      try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

        userId = decoded.userId;

        if (userId) {
          user = await userModel.findOne({ userId });
        }
      } catch (error) {
        console.log("Invalid/expired user token.");
      }
    }

    // ---------------------------------------------------------
    // If JWT did not resolve a user, resolve using email
    // ---------------------------------------------------------

    if (!user) {
      userId = generateUserId(normalizedEmail);

      user = await userModel.findOne({ userId });

      // -------------------------------------------------------
      // Create Mongo user if it doesn't exist
      // -------------------------------------------------------

      if (!user) {
        user = await userModel.create({
          userId,
          name: trimmedName,
          email: normalizedEmail,
          phoneNumber: phoneData,
        });

        console.log("New Mongo user created:", userId);
      }

      // -------------------------------------------------------
      // Create new JWT
      // -------------------------------------------------------

      newToken = jwt.sign(
        {
          userId: user.userId,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        },
      );

      res.cookie("user_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    // =========================================================
    // 6. RESOLVE HUBSPOT CONTACT
    // =========================================================

    let hubspotContactId = user.hubspotContactId || null;

    // ---------------------------------------------------------
    // If Mongo already knows the HubSpot contact, use it
    // ---------------------------------------------------------

    if (hubspotContactId) {
      console.log("Existing HubSpot contact found in Mongo:", hubspotContactId);
    }

    // ---------------------------------------------------------
    // If Mongo doesn't have the ID:
    // 1. Search HubSpot by email
    // 2. Create contact only if it doesn't exist
    // ---------------------------------------------------------

    if (!hubspotContactId) {
      console.log(
        "HubSpot contact ID missing. Searching HubSpot by email:",
        normalizedEmail,
      );

      let hubspotContact = null;

      try {
        hubspotContact = await getContactByEmail(normalizedEmail);
      } catch (error) {
        console.error(
          "HubSpot contact lookup failed:",
          error.response?.data || error.message,
        );

        throw error;
      }

      // -------------------------------------------------------
      // Existing HubSpot contact
      // -------------------------------------------------------

      if (hubspotContact?.id) {
        hubspotContactId = String(hubspotContact.id);

        console.log("Existing HubSpot contact found:", hubspotContactId);
      }

      // -------------------------------------------------------
      // Contact doesn't exist, create it
      // -------------------------------------------------------

      if (!hubspotContactId) {
        console.log("HubSpot contact not found. Creating new contact...");

        try {
          hubspotContact = await writeContact({
            firstName,
            lastName,
            email: normalizedEmail,
            phone: phoneData.fullNumber,
          });

          hubspotContactId = String(hubspotContact.id);

          console.log("New HubSpot contact created:", hubspotContactId);
        } catch (error) {
          console.error(
            "HubSpot contact creation failed:",
            error.response?.data || error.message,
          );

          throw error;
        }
      }

      // -------------------------------------------------------
      // Save HubSpot ID in Mongo
      // -------------------------------------------------------

      await userModel.updateOne(
        { userId },
        {
          $set: {
            hubspotContactId,
          },
        },
      );

      // Keep local object in sync
      user.hubspotContactId = hubspotContactId;
    }

    // =========================================================
    // SAFETY CHECK
    // =========================================================

    if (!user || !user.userId) {
      throw new Error("User could not be resolved.");
    }

    if (!hubspotContactId) {
      throw new Error(`HubSpot contact ID is missing for user ${user.userId}`);
    }

    // =========================================================
    // 7. GENERATE DETERMINISTIC LEAD ID
    // =========================================================

    const uniqueString = JSON.stringify({
      userId,
      message: trimmedMessage,
      serviceTypes: normalizedServiceTypes,
    });

    const leadId = crypto
      .createHmac("sha256", process.env.USER_ID_SECRET)
      .update(uniqueString)
      .digest("hex")
      .slice(0, 24);

    // =========================================================
    // 8. CHECK DUPLICATE LEAD
    // =========================================================

    const existingLeadDoc = await leadModel.findOne({
      userId,
      "leads.id": leadId,
    });

    if (existingLeadDoc) {
      console.log("Duplicate lead detected:", leadId);

      return res.status(200).json({
        success: true,
        message: "Lead already submitted!",
      });
    }
    // =========================================================
    // 11. CREATE HUBSPOT DEAL
    // =========================================================

    console.log("Creating HubSpot deal for contact:", hubspotContactId);

    const hubspotDeal = await writeDeal(
      {
        dealname: `Lead from ${firstName} ${lastName} for ${normalizedServiceTypes.join(
          ", ",
        )}`,

        pipeline: "default",

        dealstage: "4239665869",

        closedate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),

        dealtype: "newbusiness",

        hs_priority: "high",
      },
      hubspotContactId,
    );

    console.log("HubSpot deal created:", hubspotDeal?.id);
    // =========================================================
    // 9. PREPARE MONGO LEAD
    // =========================================================

    const newLeadEntry = {
      id: leadId,
      hubspotDealId: String(hubspotDeal.id),
      message: trimmedMessage,
      serviceTypes: normalizedServiceTypes,
      source: "website",
      status: "new-inquiry",
    };

    // =========================================================
    // 10. SAVE LEAD TO MONGODB
    // =========================================================

    const leadDoc = await leadModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          leads: newLeadEntry,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    const savedLead =
      leadDoc.leads.find((lead) => lead.id === leadId) || newLeadEntry;

    // =========================================================
    // 12. SEND EMAILS
    // =========================================================

    adminNClientARLead({
      name: user.name,
      email: normalizedEmail,
      phoneNumber: phoneData.fullNumber,
      message: trimmedMessage,
      services: savedLead.serviceTypes,
    }).catch((err) => {
      console.error("Email send failed:", err.response?.data || err.message);
    });

    // =========================================================
    // 13. FINAL RESPONSE
    // =========================================================

    return res.status(200).json({
      success: true,
      message: "Lead submitted successfully",
      isUserSessionNew: !!newToken,
      user: user,
      leads: leadDoc.leads,
    });
  } catch (error) {
    console.error(
      "Lead Error:",
      error.response?.data || error.message || error,
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
