import { model, Schema } from "mongoose";
import { IMagazine } from "./magazine.interface";

const magazineSchema = new Schema<IMagazine>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    redirect_link: {
      type: String,
      required: true,
      trim: true,
    },
    is_special: {
      type: Boolean,
      required: true,
    },
    attachment: {
      type: String,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const magazineModel = model<IMagazine>("magazine", magazineSchema);
