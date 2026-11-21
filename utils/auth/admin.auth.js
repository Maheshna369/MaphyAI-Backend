import jwt from "jsonwebtoken";
import { adminModel } from "../../models/admin.model.js";
const jwtSecret = process.env.JWT_SECRET;
const checkAdminAuthentication = async (req, res) => {
  const token = req?.cookies?.["admin_token"];
  if (!token) {
    return res.status(200).json({
      message: "Unauthorized !",
      success: false,
    });
  }
  const payload = jwt.verify(token, jwtSecret);
  const adminId = payload?.adminId;
  if (!adminId) {
    res.status(200).json({ message: "Invalid admin token !", success: false });
  }
  const admin = await adminModel.findOne({ _id: adminId }).lean();
  if (!admin) {
    return res
      .status(200)
      .json({ message: "Admin not found !", success: false });
  }
  return admin;
};

export default checkAdminAuthentication;
