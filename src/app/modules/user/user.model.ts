import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.interface";
import { UserRole } from "../../global/global.interface";

interface IUserDocument extends IUser, Document {}

const PreviousPasswordSchema = new Schema(
  {
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    profile_image: { type: String, default: undefined },
    address: { type: String, default: undefined },
    phone_number: { type: String, default: undefined },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    previousPasswords: { type: [PreviousPasswordSchema], default: [] },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const userModel = model<IUser>("user", UserSchema);
