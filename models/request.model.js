import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
    },

    leadId: {
      type: String,
      default: null,
      index: true,
    },
    requestType: {
      type: String,
      enum: ["profile", "lead-deletion", "lead-modification"],
      required: true,
    },
    message: {
      type: String,
      default: null,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: null,
    },
    resolvedBy: {
      type: String,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
const finalRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    requests: [requestSchema],
  },
  {
    timestamps: true,
  },
);
export const requestModel =
  mongoose.models.requests || mongoose.model("requests", finalRequestSchema);
