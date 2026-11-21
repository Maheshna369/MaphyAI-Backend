import { leadModel } from "../models/connection.model.js";
import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;
export const userSignIn = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ message: "Missing or Invalid field!", success: false });
    const user = await userModel.findOne({ email }).lean();
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found !", success: false });
    const leadDoc = await leadModel.findOne({ userId: user.userId }).lean();

    const token = jwt.sign(
      { userId: user.userId, name: user.name, email: user.email },
      jwtSecret,
      { expiresIn: "30d" },
    );
    if (!token)
      return res.status(401).json({ message: "Unauthorized", success: false });
    return res
      .status(200)
      .clearCookie("admin_token")
      .clearCookie("user_token")
      .cookie("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `${user.name} logged in successfully !`,
        success: true,
        user: user,
        leads: leadDoc?.leads || [],
      });
  } catch (error) {
    console.error("Error while signing user: ", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
