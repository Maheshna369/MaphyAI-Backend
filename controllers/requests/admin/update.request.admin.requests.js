import { requestModel } from "../../../models/request.model.js";
import checkAdminAuthentication from "../../../utils/auth/admin.auth.js";
export const updateRequest = async (req, res) => {
  try {
    const { userId, requestId, status, priority, adminResponse } = req?.body;
    const admin = checkAdminAuthentication(req, res);
    if (!userId || !requestId) {
      return res.status(200).json({
        message: "User Id and Request Id are required!",
        success: false,
      });
    }
    const request = await requestModel
      .findOne({ userId, "requests.requestId": requestId })
      ?.lean();
    if (!request) {
      return res
        .status(200)
        .json({ message: "Request not found!", success: false });
    }
    if (!status && !priority && !adminResponse) {
      return res.status(200).json({
        message: "Please provide at least one field to update!",
        success: false,
      });
    }
    const update = {
      "requests.$.updatedAt": new Date(),
    };

    if (status !== undefined) {
      update["requests.$.status"] = status;

      if (status === "resolved") {
        update["requests.$.resolvedAt"] = new Date();

        // Replace with whatever field your admin auth returns
        update["requests.$.resolvedBy"] = admin.adminId ?? admin.userId ?? null;
      } else {
        update["requests.$.resolvedAt"] = null;
        update["requests.$.resolvedBy"] = null;
      }
    }

    if (priority !== undefined) {
      update["requests.$.priority"] = priority;
    }

    if (adminResponse !== undefined) {
      update["requests.$.adminResponse"] = adminResponse?.trim() || null;
    }
    const updatedRequest = await requestModel
      .findOneAndUpdate(
        { userId, "requests.requestId": requestId },
        {
          $set: update,
        },
        { new: true, runValidators: true },
      )
      ?.lean();
    if (!updatedRequest) {
      return res
        .status(200)
        .json({ message: "Failed to update the request!", success: false });
    }
    return res.status(200).json({
      message: "Request updated successfully!",
      success: true,
      updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return res
      .status(500)
      .json({ message: "Internal server error!", success: false });
  }
};
