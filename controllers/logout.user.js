export const userLogout = async (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("user_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
