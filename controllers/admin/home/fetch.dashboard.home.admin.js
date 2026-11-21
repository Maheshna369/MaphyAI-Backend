import { leadModel } from "../../../models/connection.model.js";
import { requestModel } from "../../../models/request.model.js";
import { userModel } from "../../../models/user.model.js"; // change path if yours differs
import checkAdminAuthentication from "../../../utils/auth/admin.auth.js";

export const fetchDashboard = async (req, res) => {
  try {
    await checkAdminAuthentication(req, res);

    /* ---------------------------------------------------------------------- */
    /* Basic client count                                                     */
    /* ---------------------------------------------------------------------- */

    const clients = await userModel.countDocuments({});

    /* ---------------------------------------------------------------------- */
    /* Project statistics                                                     */
    /* ---------------------------------------------------------------------- */

    const projectStats = await leadModel.aggregate([
      {
        $unwind: "$leads",
      },
      {
        $group: {
          _id: null,

          total: {
            $sum: 1,
          },

          active: {
            $sum: {
              $cond: [
                {
                  $not: [
                    {
                      $in: ["$leads.status", ["won", "lost"]],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },

          won: {
            $sum: {
              $cond: [
                {
                  $eq: ["$leads.status", "won"],
                },
                1,
                0,
              ],
            },
          },

          awaitingDecision: {
            $sum: {
              $cond: [
                {
                  $eq: ["$leads.status", "awaiting-decision"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const projectSummary = projectStats[0] || {
      total: 0,
      active: 0,
      won: 0,
      awaitingDecision: 0,
    };

    /* ---------------------------------------------------------------------- */
    /* Request statistics                                                      */
    /* ---------------------------------------------------------------------- */

    const requestStats = await requestModel.aggregate([
      {
        $unwind: "$requests",
      },
      {
        $group: {
          _id: null,

          pending: {
            $sum: {
              $cond: [
                {
                  $eq: ["$requests.status", "pending"],
                },
                1,
                0,
              ],
            },
          },

          urgent: {
            $sum: {
              $cond: [
                {
                  $eq: ["$requests.priority", "urgent"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const requestSummary = requestStats[0] || {
      pending: 0,
      urgent: 0,
    };

    /* ---------------------------------------------------------------------- */
    /* Attention counts                                                        */
    /* ---------------------------------------------------------------------- */

    const attentionStats = await leadModel.aggregate([
      {
        $unwind: "$leads",
      },
      {
        $group: {
          _id: null,

          awaitingDecision: {
            $sum: {
              $cond: [
                {
                  $eq: ["$leads.status", "awaiting-decision"],
                },
                1,
                0,
              ],
            },
          },

          newInquiries: {
            $sum: {
              $cond: [
                {
                  $eq: ["$leads.status", "new-inquiry"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const attentionProjectSummary = attentionStats[0] || {
      awaitingDecision: 0,
      newInquiries: 0,
    };

    /* ---------------------------------------------------------------------- */
    /* Pipeline                                                                */
    /* ---------------------------------------------------------------------- */

    const pipelineStats = await leadModel.aggregate([
      {
        $unwind: "$leads",
      },
      {
        $group: {
          _id: "$leads.status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const pipeline = {
      "new-inquiry": 0,
      discovery: 0,
      "proposal-sent": 0,
      negotiation: 0,
      "awaiting-decision": 0,
      won: 0,
      lost: 0,
    };

    for (const item of pipelineStats) {
      if (item._id in pipeline) {
        pipeline[item._id] = item.count;
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Recent requests                                                         */
    /* ---------------------------------------------------------------------- */

    const recentRequests = await requestModel.aggregate([
      {
        $unwind: "$requests",
      },
      {
        $sort: {
          "requests.createdAt": -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          requestId: "$requests.requestId",
          leadId: "$requests.leadId",
          requestType: "$requests.requestType",
          message: "$requests.message",
          status: "$requests.status",
          priority: "$requests.priority",
          createdAt: "$requests.createdAt",
        },
      },
    ]);

    /* ---------------------------------------------------------------------- */
    /* Recent projects                                                         */
    /* ---------------------------------------------------------------------- */

    const recentProjects = await leadModel.aggregate([
      {
        $unwind: "$leads",
      },
      {
        $sort: {
          "leads.createdAt": -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          id: "$leads.id",
          userId: 1,
          message: "$leads.message",
          budget: "$leads.budget",
          status: "$leads.status",
          createdAt: "$leads.createdAt",
        },
      },
    ]);

    /* ---------------------------------------------------------------------- */
    /* Recent activity                                                         */
    /* ---------------------------------------------------------------------- */

    const recentProjectActivity = recentProjects.map((project) => ({
      id: `project-${project.id}`,
      type: "project-created",
      title: "New project created",
      description: `Project ${project.id}`,
      createdAt: project.createdAt,
      href: `/admin/clients/${project.userId}`,
    }));

    const recentRequestActivity = recentRequests.map((request) => ({
      id: `request-${request.requestId}`,
      type: "request-created",
      title: `${request.requestType} request submitted`,
      description: `Request ${request.requestId}`,
      createdAt: request.createdAt,
      href: "/admin/requests",
    }));

    const recentActivity = [...recentProjectActivity, ...recentRequestActivity]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 8);

    /* ---------------------------------------------------------------------- */
    /* Final response                                                          */
    /* ---------------------------------------------------------------------- */

    return res.status(200).json({
      message: "Dashboard fetched successfully",
      success: true,

      dashboard: {
        stats: {
          clients,

          projects: projectSummary.total,

          activeProjects: projectSummary.active,

          pendingRequests: requestSummary.pending,

          urgentRequests: requestSummary.urgent,

          wonProjects: projectSummary.won,
        },

        attention: {
          pendingRequests: requestSummary.pending,

          urgentRequests: requestSummary.urgent,

          awaitingDecision: attentionProjectSummary.awaitingDecision,

          newInquiries: attentionProjectSummary.newInquiries,
        },

        pipeline,

        recentRequests,

        recentProjects,

        recentActivity,
      },
    });
  } catch (error) {
    console.error("Error while fetching admin dashboard:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
