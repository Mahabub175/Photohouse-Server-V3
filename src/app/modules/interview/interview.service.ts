import mongoose from "mongoose";
import { IInterview } from "./interview.interface";
import { interviewModel } from "./interview.model";
import { generateSlug } from "../../utils/generateSlug";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { formatResultImage } from "../../utils/formatResultImage";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";

// Create a interview
export const createInterviewService = async (interviewData: IInterview) => {
  const slug = interviewData.slug?.trim()
    ? interviewData.slug
    : generateSlug(interviewData.name);

  const dataToSave = { ...interviewData, slug };

  const result = await interviewModel.create(dataToSave);
  return result;
};

// Create bulk interviews
const createBulkInterviewsService = async (
  interviews: Partial<IInterview>[]
) => {
  if (!interviews || !interviews.length)
    throw new Error("No interviews provided");

  const result = await interviewModel.insertMany(interviews);
  return result;
};

// Get all interviews with optional pagination & search
const getAllInterviewService = async (
  page?: number,
  limit?: number,
  searchText?: string,
  searchFields?: string[]
) => {
  let query = interviewModel.find();

  if (searchText && searchFields?.length) {
    const searchQuery = searchFields.map((field) => ({
      [field]: { $regex: searchText, $options: "i" },
    }));
    query = query.find({ $or: searchQuery });
  }

  if (page && limit) {
    const result = await paginateAndSort(query, {
      page,
      limit,
      sort: { field: "createdAt", order: "desc" },
    });

    result.results = formatResultImage<IInterview>(result.results, [
      "attachment",
      "images",
    ]) as unknown as typeof result.results;

    return result;
  }

  const results = await query.sort({ createdAt: -1 }).exec();
  return {
    results: formatResultImage<IInterview>(results, [
      "attachment",
      "images",
    ]) as IInterview[],
  };
};

// Get single interview by ID
const getSingleInterviewService = async (interviewId: string) => {
  const queryId =
    typeof interviewId === "string"
      ? new mongoose.Types.ObjectId(interviewId)
      : interviewId;

  const interview = await interviewModel.findById(queryId).exec();
  if (!interview) throwError("Interview not found", 404);
  else {
    const interviewObj = interview.toObject() as IInterview;

    if (interviewObj.attachment) {
      interviewObj.attachment = formatResultImage(
        interviewObj.attachment
      ) as string;
    }

    if (interviewObj.images && interviewObj.images.length > 0) {
      interviewObj.images = interviewObj.images.map(
        (img) => formatResultImage(img) as string
      );
    }

    return interviewObj;
  }
};

// Get single interview by slug
const getSingleInterviewBySlugService = async (slug: string) => {
  const interview = await interviewModel.findOne({ slug }).exec();
  if (!interview) throwError("Interview not found", 404);
  else {
    const interviewObj = interview.toObject() as IInterview;

    if (interviewObj.attachment) {
      interviewObj.attachment = formatResultImage(
        interviewObj.attachment
      ) as string;
    }

    if (interviewObj.images && interviewObj.images.length > 0) {
      interviewObj.images = interviewObj.images.map(
        (img) => formatResultImage(img) as string
      );
    }

    return interviewObj;
  }
};

// Update single interview
export const updateSingleInterviewService = async (
  interviewId: string | number,
  interviewData: Partial<IInterview>
) => {
  const queryId =
    typeof interviewId === "string"
      ? new mongoose.Types.ObjectId(interviewId)
      : interviewId;

  const interview = await interviewModel.findById(queryId).exec();
  if (!interview) throwError("Interview not found", 404);
  else {
    Object.keys(interviewData).forEach((key) =>
      interviewData[key as keyof IInterview] === undefined ||
      interviewData[key as keyof IInterview] === null
        ? delete interviewData[key as keyof IInterview]
        : null
    );

    if (interviewData.slug) {
      interviewData.slug = generateSlug(interviewData.slug);
    } else if (interviewData.name && interviewData.name !== interview.name) {
      interviewData.slug = generateSlug(interviewData.name);
    }

    if (
      interviewData.attachment &&
      interview.attachment &&
      interviewData.attachment !== interview.attachment
    ) {
      deleteFileSync(interview.attachment);
    }

    if (
      interviewData.images &&
      interviewData.images.length > 0 &&
      interview.images?.length
    ) {
      for (const oldImg of interview.images) {
        deleteFileSync(oldImg);
      }
    }

    const updated = await interviewModel
      .findByIdAndUpdate(
        queryId,
        { $set: interviewData },
        { new: true, runValidators: true, context: "query" }
      )
      .exec();

    if (!updated) throwError("Interview update failed", 500);

    return updated;
  }
};

// Delete single interview
export const deleteSingleInterviewService = async (
  interviewId: string | number
) => {
  const queryId =
    typeof interviewId === "string"
      ? new mongoose.Types.ObjectId(interviewId)
      : interviewId;

  const interview = await interviewModel.findById(queryId).exec();
  if (!interview) throwError("Interview not found", 404);
  else {
    if (interview.attachment) deleteFileSync(interview.attachment);

    if (interview.images && interview.images.length > 0) {
      for (const img of interview.images) deleteFileSync(img);
    }

    const deleted = await interviewModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Interview delete failed", 500);

    return deleted;
  }
};

// Delete many interviews
export const deleteManyInterviewsService = async (
  interviewIds: (string | number)[]
) => {
  const queryIds = interviewIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const interviews = await interviewModel
    .find({ _id: { $in: queryIds } })
    .exec();

  for (const interview of interviews) {
    if (interview.attachment) deleteFileSync(interview.attachment);
    if (interview.images && interview.images.length > 0) {
      for (const img of interview.images) deleteFileSync(img);
    }
  }

  const result = await interviewModel
    .deleteMany({ _id: { $in: queryIds } })
    .exec();
  return result;
};

export const interviewServices = {
  createInterviewService,
  createBulkInterviewsService,
  getAllInterviewService,
  getSingleInterviewService,
  getSingleInterviewBySlugService,
  updateSingleInterviewService,
  deleteSingleInterviewService,
  deleteManyInterviewsService,
};
