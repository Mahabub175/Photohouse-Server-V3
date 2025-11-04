import { Schema, model } from "mongoose";
import { IGallery } from "./gallery.interface";

const gallerySchema = new Schema<IGallery>(
  {
    name: { type: String, trim: true },
    attachment: { type: String },
    images: { type: [String], default: undefined },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const galleryModel = model<IGallery>("gallery", gallerySchema);
