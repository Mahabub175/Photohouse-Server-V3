import { model, Schema } from "mongoose";
import { IGlobalLinks } from "./globalLinks.interface";

const globalLinksSchema = new Schema<IGlobalLinks>(
  {
    facebook_group: { type: String, default: "" },
    submit_photo: { type: String, default: "" },
    instagram: { type: String, default: "" },
    sponsor: { type: String, default: "" },
    linked_in: { type: String, default: "" },
    facebook_page: { type: String, default: "" },
    submission_link: { type: String, default: "" },
    pagel_email: { type: String, default: "" },
    pagel_facebook: { type: String, default: "" },
    pagel_instagram: { type: String, default: "" },
    pagel_web: { type: String, default: "" },
    sabbir_email: { type: String, default: "" },
    sabbir_facebook: { type: String, default: "" },
    sabbir_instagram: { type: String, default: "" },
    sabbir_web: { type: String, default: "" },
    twitter: { type: String, default: "" },
    Insta_access_token: { type: String, default: "" },
    pagel_photo: { type: String, default: "" },
  },
  { timestamps: true }
);

export const globalLinksModel = model<IGlobalLinks>(
  "globalLinks",
  globalLinksSchema
);
