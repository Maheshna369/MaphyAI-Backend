import { userModel } from "../../../../models/user.model.js";
import { leadModel } from "../../../../models/connection.model.js";
import checkAdminAuthentication from "../../../../utils/auth/admin.auth.js";
import { verifyPassword } from "../../../../utils/hash/admin.password.hash.js";
import { deleteDeal, updateDeal } from "../../../../utils/leads/write.deal.js";
import { deleteContact } from "../../../../utils/leads/write.contact.js";

export const updateLeadClient = async (req, res) => {
  try {
    const { userId, leadId, budget, timeline, status } = req?.body;
    const admin = await checkAdminAuthentication(req, res);
    if (!userId) {
      return res
        .status(200)
        .json({ message: "Missing or Invalid User Id", success: false });
    }
    if (!leadId) {
      return res
        .status(200)
        .json({ message: "Missing or Invalid Lead Id", success: false });
    }
    const hasBudget = budget !== undefined;
    const hasTimeline = timeline !== undefined;
    const hasStatus = status !== undefined;
    const HUBSPOT_STAGE_MAP = {
      "new-inquiry": "4239665869",
      contacted: "4248639181",
      discovery: "4247909107",
      "proposal-sent": "4248672979",
      negotiation: "4249956070",
      "awaiting-decision": "4249369315",
      won: "4249967310",
      lost: "4249369316",
    };
    if (!hasBudget && !hasTimeline && !hasStatus) {
      return res
        .status(200)
        .json({ message: "Missing or Invalid fields!", success: false });
    }
    const user = await userModel.findOne({ userId });
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found !", success: false });
    }
    const lead = await leadModel.findOne({
      userId,
      "leads.id": leadId,
    });

    if (!lead) {
      return res.status(200).json({
        message: "Lead not found!",
        success: false,
      });
    }

    const existingLead = lead.leads.find((lead) => lead.id === leadId);

    if (!existingLead) {
      return res.status(200).json({
        message: "Lead not found!",
        success: false,
      });
    }

    // -------------------------
    // Update HubSpot
    // -------------------------

    const hubspotProperties = {};

    if (hasBudget) {
      hubspotProperties.amount =
        typeof budget === "string"
          ? budget.replace(/[₹,\s]/g, "").trim()
          : (budget ?? "");
    }

    if (hasTimeline && timeline?.timelineValue) {
      hubspotProperties.your_timeline_property =
        timeline === null
          ? ""
          : `${String(timeline.timelineValue ?? "").trim()} ${
              timeline.timelineUnit ?? "weeks"
            }`;
    }

    if (hasStatus) {
      hubspotProperties.dealstage = HUBSPOT_STAGE_MAP[status];
    }

    if (
      existingLead.hubspotDealId &&
      Object.keys(hubspotProperties).length > 0
    ) {
      await updateDeal(existingLead.hubspotDealId, hubspotProperties);
    }

    // -------------------------
    // Update MongoDB
    // -------------------------

    const update = {};

    if (hasBudget) {
      update["leads.$.budget"] =
        typeof budget === "string" ? budget.trim() || null : budget;
    }

    if (hasTimeline) {
      if (timeline === null || timeline === undefined) {
        update["leads.$.timeline"] = null;
      } else {
        update["leads.$.timeline"] = {
          timelineValue: String(timeline.timelineValue ?? "").trim(),

          timelineUnit: timeline.timelineUnit ?? "weeks",
        };
      }
    }

    if (hasStatus) {
      update["leads.$.status"] = status;
    }

    const updatedLead = await leadModel.findOneAndUpdate(
      {
        userId,
        "leads.id": leadId,
      },
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedLead) {
      return res.status(200).json({
        message: "Lead update unsuccessful!",
        success: false,
      });
    }

    const updatedLeadData = updatedLead.leads.find(
      (lead) => lead.id === leadId,
    );

    return res.status(200).json({
      message: "Lead updated successfully!",
      success: true,
      lead: updatedLeadData,
    });
  } catch (error) {
    console.error("Error while updating the lead of the client: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const deleteLeadClient = async (req, res) => {
  try {
    const { password, userId, leadId } = req?.body;
    const admin = await checkAdminAuthentication(req, res);
    if (!password) {
      return res
        .status(200)
        .json({ message: "Missing or Invalid Password", success: false });
    }

    if (!userId) {
      return res
        .status(200)
        .json({ message: "Missing or Invalid User Id", success: false });
    }
    if (!leadId) {
      return res
        .status(200)
        .json({ message: "Missing or Invalid Lead Id", success: false });
    }
    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      return res.status(200).json({
        message: "Invalid Password Entered, Please try again!",
        success: false,
      });
    }
    const user = await userModel.findOne({ userId })?.lean();
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found !", success: false });
    }
    // //Delete Hubspot Contact first
    // if (user.hubspotContactId) {
    //   await deleteContact(user.hubspotContactId);
    // }
    // Find the parent document and the exact lead
    const leadDocument = await leadModel
      .findOne({
        userId,
        "leads.id": leadId,
      })
      .lean();

    if (!leadDocument) {
      return res.status(200).json({
        message: "Lead not found!",
        success: false,
      });
    }

    const lead = leadDocument.leads.find((lead) => lead.id === leadId);

    if (!lead) {
      return res.status(200).json({
        message: "Lead not found!",
        success: false,
      });
    }

    // Delete HubSpot deal first
    if (lead.hubspotDealId) {
      await deleteDeal(lead.hubspotDealId);
    }

    // Remove lead from MongoDB
    const updatedLead = await leadModel.findOneAndUpdate(
      {
        userId,
        "leads.id": leadId,
      },
      {
        $pull: {
          leads: {
            id: leadId,
          },
        },
      },
      {
        new: true,
      },
    );

    if (!updatedLead) {
      return res.status(200).json({
        message: "Lead deletion unsuccessful!",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Lead deleted successfully!",
      success: true,
    });
  } catch (error) {
    console.error("Error while deleting lead of client:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
