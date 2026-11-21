import { Type } from "@google/genai";

export const sendNewServiceRequestEmailToAdminTool = {
  name: "send_new_service_request_email_to_admin",
  description:
    "Sends an email to the MaphyAI owner, Mahesh Nayak, when a user submits a new service request through the MaphyAI website. This tool is used to notify the admin about new service requests.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The client's name, if known.",
      },
      email: {
        type: "string",
        description: "The client's email address, if known.",
      },
      phoneNumber: {
        type: "string",
        description: "The client's phone number, if known.",
      },
      message: {
        type: "string",
        description:
          "The message or project request that should be sent to Mahesh Nayak.",
      },
      services: {
        type: "array",
        items: {
          type: "string",
        },
        description: "The MaphyAI services relevant to the client's request.",
      },
    },
    required: ["message"],
    additionalProperties: false,
  },
};
// export const tools = [
//   {
//     type: "function",
//     function: {
//       name: "get_order_count",
//       description:
//         "Get the total number of order requests made by the logged-in user.",
//       parameters: { type: "object", properties: {} },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "list_order_requests",
//       description:
//         "List the logged-in user's order requests with their id, service, status and date.",
//       parameters: { type: "object", properties: {} },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "get_order_status",
//       description:
//         "Get the status and details of one order request, by its id or the service name.",
//       parameters: {
//         type: "object",
//         properties: {
//           orderId: {
//             type: "string",
//             description: "The order request id, if the user gave it",
//           },
//         },
//       },
//     },
//   },
// ];

export const sendSupportRequestNotificationTool = {
  name: "send_support_request_notification",
  description:
    "Sends a support request notification to the MaphyAI owner, Mahesh Nayak, when the user explicitly asks for support or has a question about MaphyAI. ",
  parametersJsonSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description:
          "The unique identifier of the user making the support request.",
      },
      name: {
        type: "string",
        description: "The name of the user making the support request.",
      },
      email: {
        type: "string",
        description:
          "The email address of the user making the support request.",
      },
      phoneNumber: {
        type: "string",
        description: "The phone number of the user making the support request.",
      },
      projectName: {
        type: "string",
        description:
          "The name of the project related to the support request, if applicable.",
      },
      requestType: {
        type: "string",
        description:
          "The type of support request, e.g., 'Technical Issue', 'Billing Inquiry', etc.",
      },
      message: {
        type: "string",
        description:
          "The detailed message or question from the user regarding their support request.",
      },
      referenceUrl: {
        type: "string",
        description:
          "A URL reference related to the support request, if applicable.",
      },
    },
    required: ["userId", "name", "email", "message"],
  },
};
export const getAccountInfoTool = {
  name: "get_account_info",
  description:
    "Get the logged-in user's account information, including name, email, phone number, and account creation date.",
};
export const getOrderCountTool = {
  name: "get_order_count",
  description:
    "Get the total number of order requests (leads) made by the logged-in user.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const listOrderRequestsTool = {
  name: "list_order_requests",
  description:
    "List the logged-in user's recent order requests with id, service, status and date.",
};

export const getOrderStatusTool = {
  name: "get_order_status",
  description:
    "Get the status and details of one of the logged-in user's order requests by its id. If the id is unknown, call list_order_requests first.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: {
        type: Type.STRING,
        description: "The id of the order request.",
      },
    },
    required: ["orderId"],
  },
};
