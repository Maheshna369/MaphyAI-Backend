import { leadModel } from "../../models/connection.model.js";
import checkAdminAuthentication from "../../utils/auth/admin.auth.js";

export const fetchProjects = async (req, res) => {
  try {
    const { page, limit } = req.query;

    if (!page || !limit) {
      return res.status(400).json({
        message: "Page and limit are required",
        success: false,
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res.status(400).json({
        message: "Page and limit must be positive integers",
        success: false,
      });
    }

    await checkAdminAuthentication(req, res);

    const projects = await leadModel
      .find({})
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const total = await leadModel.countDocuments({});

    return res.status(200).json({
      message: "Projects fetched successfully",
      success: true,
      projects,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber * limitNumber < total,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Error while fetching projects:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
