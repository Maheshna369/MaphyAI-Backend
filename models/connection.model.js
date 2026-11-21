import mongoose from "mongoose";
const SERVICE_TYPES = [
  "business_website",
  "ai_chatbot_integration",
  "custom_web_application",
  "website_redesign",
  "ecommerce_website",
  "not_sure",
];

const leadItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    hubspotDealId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    serviceTypes: [
      {
        type: String,
        enum: SERVICE_TYPES,
      },
    ],
    budget: {
      type: String,
    },
    timeline: {
      timelineValue: {
        type: String,
        default: null,
      },
      timelineUnit: {
        type: String,
        enum: ["days", "weeks", "months"],
        default: null,
      },
    },
    source: {
      type: String,
      default: "website",
    },
    status: {
      type: String,
      enum: [
        "new-inquiry",
        "contacted",
        "discovery",
        "proposal-sent",
        "negotiation",
        "awaiting-decision",
        "won",
        "lost",
      ],
      default: "new-inquiry",
    },
  },
  {
    timestamps: true,
  },
);

const leadSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      index: true,
      required: true,
    },

    leads: [leadItemSchema],
  },
  {
    timestamps: true,
  },
);

export const leadModel =
  mongoose.models.leads || mongoose.model("leads", leadSchema);
