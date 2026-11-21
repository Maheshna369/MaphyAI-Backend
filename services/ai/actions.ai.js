import { adminNClientARLead } from "../../utils/email/lead.email.js";
import { leadModel } from "../../models/connection.model.js";
import { sendSupportRequestNotification } from "../../utils/email/query.email.js";
export const sendEmailOnNewServiceRequestToAdmin = async ({
  name,
  email,
  phoneNumber,
  message,
  services,
}) => {
  try {
    console.log("📧 sendEmailToAdmin CALLED");
    console.log({
      name,
      email,
      phoneNumber,
      message,
      services,
    });

    const result = await adminNClientARLead({
      name,
      email,
      phoneNumber,
      message,
      services,
    });

    console.log("📧 adminNClientARLead RESULT:", result);

    return {
      success: result?.success ?? false,
      adminResponse: result?.adminResponse ?? null,
    };
  } catch (error) {
    console.error("❌ sendEmailToAdmin ERROR:", error);

    return {
      success: false,
      adminResponse: null,
    };
  }
};

// export const sendQueryToAdmin=async({
//   userId, name, email, phoneNumber, query
// }=>{
//   try {

//   } catch (error) {

//   }
// })
export const handlers = {
  async send_support_request_notification(args = {}, user) {
    try {
      console.log("📧 sendSupportRequestNotification CALLED");

      if (!user?.userId) {
        return {
          success: false,
          message: "User must be logged in.",
        };
      }

      const {
        projectName = "",
        requestType = "General Enquiry",
        message,
        referenceUrl = "",
      } = args;

      if (!message?.trim()) {
        return {
          success: false,
          message: "Please provide details of your support request.",
        };
      }

      const result = await sendSupportRequestNotification({
        userId: user.userId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        projectName,
        requestType,
        message,
        referenceUrl,
      });

      console.log("📧 Support notification sent:", result?.id);

      return {
        success: true,
        message: "Support request submitted successfully.",
        emailId: result?.id ?? null,
      };
    } catch (error) {
      console.error("❌ Support notification error:", error);

      return {
        success: false,
        message: error.message || "Failed to submit support request.",
      };
    }
  },
  async get_account_info(_args, user) {
    if (!user?.userId) {
      return { success: false, message: "The user must be logged in." };
    }
    return {
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  },
  async get_order_count(_args, user) {
    const leadDoc = await leadModel.findOne({ userId: user.userId }).lean();
    return { success: true, count: leadDoc?.leads?.length ?? 0 };
  },

  async list_order_requests(_args, user) {
    const leadDoc = await leadModel.findOne({ userId: user.userId }).lean();

    const orders = (leadDoc?.leads ?? [])
      .slice(-20)
      .reverse()
      .map((l) => ({
        id: String(l._id),
        service: l.services ?? l.service,
        status: l.status,
        createdAt: l.createdAt,
      }));

    return { success: true, orders };
  },

  async get_order_status({ orderId }, user) {
    if (!orderId) {
      return {
        success: false,
        message:
          "No order id provided. Ask the user which request, or list their requests.",
      };
    }

    const leadDoc = await leadModel.findOne({ userId: user.userId }).lean();
    const lead = leadDoc?.leads?.find((l) => String(l._id) === String(orderId));

    if (!lead) {
      return {
        success: false,
        message: "No order request found with that id for this user.",
      };
    }

    // Return only what the user should see (adjust to your schema)
    return {
      success: true,
      order: {
        id: String(lead._id),
        service: lead.services ?? lead.service,
        status: lead.status,
        message: lead.message,
        budget: lead.budget,
        timeline: lead.timeline,
        createdAt: lead.createdAt,
      },
    };
  },
};

export const executeAITool = async (name, args, user) => {
  console.log("🔧 executeAITool CALLED:", name);
  console.log("🔧 args:", args);

  switch (name) {
    case "send_email_to_admin":
      return await sendEmailOnNewServiceRequestToAdmin({
        name: args?.name ?? "",
        email: args?.email ?? "",
        phoneNumber: args?.phoneNumber ?? "",
        message: args?.message ?? "",
        services: Array.isArray(args?.services) ? args.services : [],
      });

    default: {
      const handler = handlers[name];
      if (!handler) throw new Error(`Unknown AI tool: ${name}`);

      // every handler other than the email tool needs a logged-in user
      if (!user?.userId) {
        return { success: false, message: "The user must be logged in." };
      }

      return await handler(args ?? {}, user);
    }
  }
};
