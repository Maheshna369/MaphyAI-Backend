import jwt from "jsonwebtoken";
import { adminModel } from "../../models/admin.model.js";
import { verifyPassword } from "../../utils/hash/admin.password.hash.js";
import { redisClient } from "../../config/redis.config.js";
const jwtSecret = process.env.JWT_SECRET;
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    console.log("Login attempt from IP: ", ip);
    const key = `admin:login:attempts:${ip}`;
    const attempts = await redisClient.get(key);
    console.log("Current login attempts for IP ", ip, ": ", attempts);
    if (attempts && Number(attempts) >= 3) {
      return res.status(429).json({
        message: "Too many login attempts. Try again later.",
        success: false,
      });
    }
    if (!username || !password) {
      return res.status(400).json({
        message: "Missing or Invalid fields !",
        success: false,
      });
    }
    const admin = await adminModel.findOne({ username }).lean();
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found ! Please check your username.",
        success: false,
      });
    }
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      const newAttempts = await redisClient.incr(key);

      // set expiry only first time
      if (newAttempts === 1) {
        await redisClient.expire(key, 15 * 60); // 15 min
      }

      return res.status(401).json({
        message: "Unauthorized access ! Please check your password.",
        success: false,
      });
    }
    const token = jwt.sign(
      {
        adminId: admin._id,
        adminType: admin.adminType,
      },
      jwtSecret,
      { expiresIn: "1d" },
    );
    await redisClient.del(key);
    return res
      .status(200)
      .clearCookie("user_token")
      .cookie("admin_token", token, {
        httpOnly: true, // Protects against XSS attacks
        secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
        sameSite: "strict", // Protects against CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      })
      .json({
        message: "Admin logged in successfully !",
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
    console.error("Error in adminLogin controller: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
