import jwt from "jsonwebtoken";
import { adminModel } from "../../../../models/admin.model.js";
import { userModel } from "../../../../models/user.model.js";
import checkAdminAuthentication from "../../../../utils/auth/admin.auth.js";
const jwtSecret = process.env.JWT_SECRET;
export const getAllClients = async (req, res) => {
  try {
    const admin = await checkAdminAuthentication(req, res);
    const users = await userModel.find({}).lean();
    return res.status(200).json({
      message: "Clients fetched successfully!",
      success: true,
      clients: users,
    });
  } catch (error) {
    console.error("Error in getAllClients controller: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
