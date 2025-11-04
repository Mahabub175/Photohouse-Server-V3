import { Schema, model } from "mongoose";
import { IInterview } from "./interview.interface";
import { generateSlug } from "../../utils/generateSlug";

const interviewSchema = new Schema<IInterview>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    interviewer_name: { type: String, trim: true },
    interviewee_profession: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    publishedAt: { type: String, required: true, trim: true },
    attachment: { type: String },
    images: { type: [String], default: undefined },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

interviewSchema.pre("validate", async function (next) {
  if (!this.slug && this.name) {
    let newSlug = generateSlug(this.name);
    let slugExists = await model<IInterview>("interview").exists({
      slug: newSlug,
    });
    let suffix = 1;

    while (slugExists) {
      newSlug = `${generateSlug(this.name)}-${suffix}`;
      slugExists = await model<IInterview>("interview").exists({
        slug: newSlug,
      });
      suffix++;
    }

    this.slug = newSlug;
  }
  next();
});

export const interviewModel = model<IInterview>("interview", interviewSchema);
