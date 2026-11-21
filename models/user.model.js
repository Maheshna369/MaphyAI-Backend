import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    hubspotContactId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      country: { type: String },
      countryCode: { type: String },
      number: { type: String, sparse: true },
      fullNumber: { type: String, sparse: true },
    },
  },
  { timestamps: true },
);
export const userModel =
  mongoose.models.users || mongoose.model("users", userSchema);
