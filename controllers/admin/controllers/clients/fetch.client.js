import { userModel } from "../../../../models/user.model.js";
import { leadModel } from "../../../../models/connection.model.js";
import checkAdminAuthentication from "../../../../utils/auth/admin.auth.js";

const fetchClient = async (req, res) => {
  try {
    const { userId } = req?.query;
    if (!userId) {
      return res
        .status(200)
        .json({ message: "Missing or Invalid Client !", success: false });
    }

    const admin = await checkAdminAuthentication(req, res);
    const user = await userModel.findOne({ userId: userId })?.lean();
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found !", success: false });
    }
    const leads = await leadModel.findOne({ userId: user?.userId })?.lean();
    if (!leads) {
      return res
        .status(200)
        .json({ message: `No leads found of ${user?.name}`, success: true });
    }
    const formattedLeads = leads?.leads;
    return res.status(200).json({
      message: "Data fetched successfully !",
      success: true,
      user: user,
      leads: formattedLeads,
    });
  } catch (error) {
    console.error("Error while fetching client's details: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export default fetchClient;
