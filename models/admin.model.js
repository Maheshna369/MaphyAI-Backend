import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminType: {
      type: String,
      enum: ["root", "iam"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      index: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayPicture: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const adminModel =
  mongoose.models.admins || mongoose.model("admins", adminSchema);
