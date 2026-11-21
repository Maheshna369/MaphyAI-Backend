import { userModel } from "../../../../models/user.model.js";
import { updateContact } from "../../../../utils/leads/write.contact.js";
import checkAdminAuthentication from "../../../../utils/auth/admin.auth.js";
import parsePhoneNumber from "libphonenumber-js";

const updateClient = async (req, res) => {
  try {
    const { userId, name, email, phoneNumber } = req?.body;

    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    let normalizedPhoneNumber;

    if (phoneNumber) {
      normalizedPhoneNumber = parsePhoneNumber(phoneNumber);
    }

    // -----------------------------------
    // Validate userId
    // -----------------------------------

    if (!userId) {
      return res.status(200).json({
        message: "Missing or Invalid User Id",
        success: false,
      });
    }

    // -----------------------------------
    // Validate fields
    // -----------------------------------

    const hasName = !!normalizedName;
    const hasEmail = !!normalizedEmail;
    const hasPhone = !!normalizedPhoneNumber?.number;

    if (!hasName && !hasEmail && !hasPhone) {
      return res.status(200).json({
        message: "Missing or Invalid fields!",
        success: false,
      });
    }

    // -----------------------------------
    // Validate email
    // -----------------------------------

    if (hasEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(200).json({
          message: "Invalid email address!",
          success: false,
        });
      }
    }

    // -----------------------------------
    // Validate phone
    // -----------------------------------

    if (phoneNumber) {
      if (!normalizedPhoneNumber || !normalizedPhoneNumber.isValid()) {
        return res.status(200).json({
          message: "Invalid phone number!",
          success: false,
        });
      }
    }

    // -----------------------------------
    // Admin authentication
    // -----------------------------------

    const admin = await checkAdminAuthentication(req, res);

    // -----------------------------------
    // Find existing user
    // -----------------------------------

    const user = await userModel.findOne({ userId }).lean();

    if (!user) {
      return res.status(200).json({
        message: "User not found!",
        success: false,
      });
    }

    // -----------------------------------
    // Build MongoDB update
    // -----------------------------------

    const update = {};

    // -----------------------------------
    // Build HubSpot update
    // -----------------------------------

    const hubspotUpdate = {};

    const fieldsUpdated = [];

    // -----------------------------------
    // Name
    // -----------------------------------

    if (hasName) {
      update.name = normalizedName;

      fieldsUpdated.push("name");

      const nameParts = normalizedName.split(/\s+/);

      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      hubspotUpdate.firstname = firstName;
      hubspotUpdate.lastname = lastName;
    }

    // -----------------------------------
    // Email
    // -----------------------------------

    if (hasEmail) {
      update.email = normalizedEmail;

      fieldsUpdated.push("email");

      hubspotUpdate.email = normalizedEmail;
    }

    // -----------------------------------
    // Phone
    // -----------------------------------

    if (hasPhone) {
      const formattedPhoneNumber = {
        country: normalizedPhoneNumber.country,
        countryCode: `+${normalizedPhoneNumber.countryCallingCode}`,
        number: normalizedPhoneNumber.nationalNumber,
        fullNumber: normalizedPhoneNumber.number,
      };

      update.phoneNumber = formattedPhoneNumber;

      fieldsUpdated.push("phone-number");

      hubspotUpdate.phone = normalizedPhoneNumber.number;
    }

    // -----------------------------------
    // Update HubSpot contact
    // -----------------------------------

    if (user.hubspotContactId && Object.keys(hubspotUpdate).length > 0) {
      await updateContact(hubspotUpdate, user.hubspotContactId);
    }

    // -----------------------------------
    // Update MongoDB
    // -----------------------------------

    const updatedUser = await userModel
      .findOneAndUpdate(
        { userId },
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean();

    if (!updatedUser) {
      return res.status(200).json({
        message: "User not found OR, update unsuccessful!",
        success: false,
      });
    }

    // -----------------------------------
    // Determine updated fields
    // -----------------------------------

    const whichFieldUpdated =
      fieldsUpdated.length === 1 ? fieldsUpdated[0] : "all";

    // -----------------------------------
    // Response
    // -----------------------------------

    return res.status(200).json({
      message: "Data updated successfully!",
      success: true,
      whichFieldUpdated,
      fieldsUpdated,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error while updating data of client:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export default updateClient;
