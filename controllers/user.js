import { leadModel } from "../models/connection.model.js";
import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const getUser = async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const userToken = req.cookies?.["user_token"];
    if (!userToken)
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    const payload = jwt.verify(userToken, jwtSecret);
    const userId = payload?.userId;
    if (!userId)
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    const user = await userModel.findOne({ userId });
    if (!user)
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    const leads = await leadModel.findOne({ userId });
    return res.status(200).json({
      message: "User fetched successfully",
      success: true,
      user: user,
      leads: leads?.leads || [],
    });
  } catch (error) {
    console.error("Error in getUser controller: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
