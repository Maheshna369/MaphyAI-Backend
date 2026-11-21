import { requestModel } from "../../../models/request.model.js";
import checkAdminAuthentication from "../../../utils/auth/admin.auth.js";

export const fetchRequests = async (req, res) => {
  try {
    const admin = await checkAdminAuthentication(req, res);
    const allRequests = await requestModel.find({})?.lean();
    if (!allRequests) {
      return res.status(200).json({
        message: "No Requests exists, please try again!",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Data fetched successfully!",
      success: true,
      allRequests,
    });
  } catch (error) {
    console.error("Error while fetching all requests: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
