import { Schema, model } from "mongoose";
import { IArtist, IMedia } from "./media.interface";
import { generateSlug } from "../../utils/generateSlug";

const artistSchema = new Schema<IArtist>({
  image: { type: String },
  name: { type: String },
  profession: { type: String },
  facebook: { type: String },
  instagram: { type: String },
  website: { type: String },
  country: { type: String },
  flag: { type: String },
  is_default: { type: Boolean, default: false },
});

const mediaSchema = new Schema<IMedia>({
  artists: { type: [artistSchema] },
  image: { type: String, required: true },
  slug: { type: String },
  home_slider: { type: Boolean, default: false },
  click: { type: String },
  flag: { type: String },
  status: {
    type: Boolean,
    default: true,
  },
});

mediaSchema.pre("save", function (next) {
  if (this.artists.length > 0) {
    this.click = this.artists[0].name || "";
    this.flag = this.artists[0].flag || "";
  } else {
    this.click = "";
    this.flag = "";
  }

  if (!this.slug) {
    this.slug =
      this.artists.length > 0
        ? generateSlug(this.artists[0].name)
        : generateSlug("media-" + Date.now());
  }

  next();
});

export const mediaModel = model<IMedia>("media", mediaSchema);
