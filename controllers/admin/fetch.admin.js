import jwt from "jsonwebtoken";
import { adminModel } from "../../models/admin.model.js";

const jwtSecret = process.env.JWT_SECRET;
export const getAdmin = async (req, res) => {
  try {
    const adminToken = req.cookies?.["admin_token"];
    if (!adminToken)
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    const payload = jwt.verify(adminToken, jwtSecret);
    const adminId = payload?.adminId;
    if (!adminId)
      return res.status(401).json({ message: "Unauthorized", success: false });
    const admin = await adminModel.findOne({ _id: adminId }).lean();
    if (!admin)
      return res
        .status(404)
        .clearCookie("user_token")
        .json({ message: "Admin not found !", success: false });
    return res.status(200).json({
      message: "Admin fetched successfully",
      success: true,
      admin: {
        name: admin.name,
        username: admin.username,
        email: admin.email,
        adminType: admin.adminType,
        displayPicture: admin.displayPicture,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in getAdmin controller: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
