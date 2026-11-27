import crypto from "crypto";

import { requestModel } from "../../models/request.model.js";
import { leadModel } from "../../models/connection.model.js";
import checkUserAuthentication from "../../utils/auth/user.auth.js";

const generateRequestId = (userId, leadId, requestType, message) => {
  try {
    if (!userId || !requestType) {
      throw new Error("userId and requestType are required");
    }

    const normalizedUserId = String(userId).trim();
    const normalizedLeadId = leadId ? String(leadId).trim() : "";
    const normalizedRequestType = String(requestType).trim().toLowerCase();
    const normalizedMessage =
      typeof message === "string" ? message.trim().toLowerCase() : "";

    let uniqueString;

    if (normalizedRequestType === "lead-deletion") {
      uniqueString = JSON.stringify({
        userId: normalizedUserId,
        leadId: normalizedLeadId,
        requestType: normalizedRequestType,
      });
    } else if (normalizedRequestType === "lead-modification") {
      uniqueString = JSON.stringify({
        userId: normalizedUserId,
        leadId: normalizedLeadId,
        requestType: normalizedRequestType,
        message: normalizedMessage,
      });
    } else if (normalizedRequestType === "profile") {
      uniqueString = JSON.stringify({
        userId: normalizedUserId,
        requestType: normalizedRequestType,
        message: normalizedMessage,
      });
    } else {
      throw new Error("Invalid request type");
    }

    return crypto
      .createHmac("sha256", process.env.USER_ID_SECRET)
      .update(uniqueString)
      .digest("hex")
      .slice(0, 24);
  } catch (error) {
    console.error("Error while generating request ID:", error);
    throw error;
  }
};

export const userRequest = async (req, res) => {
  try {
    const { leadId, requestType, message } = req?.body;

    if (!requestType) {
      return res.status(200).json({
        message: "Missing or Invalid Request Type!",
        success: false,
      });
    }

    const user = await checkUserAuthentication(req, res);

    if (!user?.userId) {
      return res.status(200).json({
        message: "Unauthorized!",
        success: false,
      });
    }

    const normalizedRequestType = String(requestType).trim().toLowerCase();

    const normalizedMessage = typeof message === "string" ? message.trim() : "";

    // Message is required only for profile and lead modification
    if (
      (normalizedRequestType === "profile" ||
        normalizedRequestType === "lead-modification") &&
      !normalizedMessage
    ) {
      return res.status(200).json({
        success: false,
        message: "Message is required for this request type.",
      });
    }

    // Lead-related requests
    if (
      normalizedRequestType === "lead-deletion" ||
      normalizedRequestType === "lead-modification"
    ) {
      if (!leadId) {
        return res.status(200).json({
          message: "Missing or Invalid Lead Id",
          success: false,
        });
      }

      const leadDocument = await leadModel
        .findOne({
          userId: user.userId,
          "leads.id": leadId,
        })
        .lean();

      if (!leadDocument) {
        return res.status(200).json({
          message: "Lead doesn't exist, can't send request!",
          success: false,
        });
      }

      const requestId = generateRequestId(
        user.userId,
        leadId,
        normalizedRequestType,
        normalizedMessage,
      );

      const existingRequest = await requestModel
        .findOne({ userId: user.userId, "requests.requestId": requestId })
        .lean();

      if (existingRequest) {
        return res.status(200).json({
          message: "You've already requested!",
          success: false,
        });
      }

      let newRequest;

      if (normalizedRequestType === "lead-deletion") {
        newRequest = {
          requestId,
          leadId,
          requestType: "lead-deletion",
          message: null,
          status: "pending",
          priority: "high",
        };
      } else {
        newRequest = {
          requestId,
          leadId,
          requestType: "lead-modification",
          message: normalizedMessage,
          status: "pending",
          priority: "high",
        };
      }

      const updatedDocument = await requestModel.findOneAndUpdate(
        { userId: user.userId },
        {
          $push: {
            requests: newRequest,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );

      const createdRequest = updatedDocument.requests.at(-1);

      return res.status(200).json({
        message: "Request submitted successfully!",
        success: true,
        request: createdRequest,
      });
    }

    // Profile request
    if (normalizedRequestType === "profile") {
      const requestId = generateRequestId(
        user.userId,
        null,
        normalizedRequestType,
        normalizedMessage,
      );

      const existingRequest = await requestModel
        .findOne({ userId: user.userId, "requests.requestId": requestId })
        .lean();

      if (existingRequest) {
        return res.status(200).json({
          message: "You've already requested!",
          success: false,
        });
      }

      const newRequest = {
        requestId,

        leadId: null,
        requestType: "profile",
        message: normalizedMessage,
        status: "pending",
        priority: "urgent",
      };

      const updatedDocument = await requestModel.findOneAndUpdate(
        { userId: user.userId },
        {
          $push: {
            requests: newRequest,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );

      const createdRequest = updatedDocument.requests.at(-1);

      return res.status(200).json({
        message: "Request submitted successfully!",
        success: true,
        request: createdRequest,
      });
    }

    return res.status(200).json({
      message: "Invalid Request Type, please try again!",
      success: false,
    });
  } catch (error) {
    console.error("Error while processing user request:", error);

    return res.status(500).json({
      message: "Something went wrong while processing your request.",
      success: false,
    });
  }
};

export const fetchUserRequest = async (req, res) => {
  try {
    const user = await checkUserAuthentication(req, res);
    if (res.headersSent) return;

    if (!user?.userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const userRequests = await requestModel
      .findOne({ userId: user.userId })
      ?.lean();
    if (!userRequests) {
      return res
        .status(200)
        .json({ message: "No User Requests exists!", success: false });
    }
    return res.status(200).json({
      message: "Data fetched successfully!",
      success: true,
      userRequests,
    });
  } catch (error) {
    console.error("Error while fetching user requests:", error);

    if (res.headersSent) return;

    return res.status(500).json({
      message: "Something went wrong while processing your request.",
      success: false,
    });
  }
};
