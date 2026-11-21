import jwt from "jsonwebtoken";
import { userModel } from "../../models/user.model.js";
const jwtSecret = process.env.JWT_SECRET;
const checkUserAuthentication = async (req, res) => {
  const token = req?.cookies?.["user_token"];
  if (!token) {
    return res.status(200).json({
      message: "Unauthorized !",
      success: false,
    });
  }
  const payload = jwt.verify(token, jwtSecret);
  const userId = payload?.userId;
  if (!userId) {
    res.status(200).json({ message: "Invalid user token !", success: false });
  }
  const user = await userModel.findOne({ userId }).lean();
  if (!user) {
    return res
      .status(200)
      .json({ message: "User not found !", success: false });
  }
  return user;
};

export default checkUserAuthentication;
