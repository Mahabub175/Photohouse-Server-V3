import { FastifyRequest, FastifyReply } from "fastify";
import { interviewServices } from "./interview.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IInterview } from "./interview.interface";
import { parseMultipartBody } from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";

// Create a interview
const createInterviewController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const attachmentPath = await uploadService(req, "attachment");
    const imagesPath = await uploadService(req, "images");

    const images = Array.isArray(imagesPath)
      ? imagesPath
      : imagesPath
      ? [imagesPath]
      : [];

    const formData = {
      ...data,
      ...(attachmentPath ? { attachment: attachmentPath } : {}),
      ...(images.length ? { images } : {}),
    };

    const result = await interviewServices.createInterviewService(
      formData as IInterview
    );

    return responseSuccess(reply, result, "Interview Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk interviews
const createBulkInterviewsController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const interviews = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(interviews) || !interviews.length) {
      return responseError(reply, "No interviews provided", 400);
    }

    const createdInterviews =
      await interviewServices.createBulkInterviewsService(interviews);

    return responseSuccess(
      reply,
      createdInterviews,
      `${createdInterviews.length} interviews created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create interviews",
      500,
      err
    );
  }
};

// Get all interviews
const getAllInterviewController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as Record<string, any>;
    const pageNumber = query.page ? parseInt(query.page, 10) : undefined;
    const pageSize = query.limit ? parseInt(query.limit, 10) : undefined;
    const searchText = query.searchText as string | undefined;
    const searchFields = ["name"];
    const result = await interviewServices.getAllInterviewService(
      pageNumber,
      pageSize,
      searchText,
      searchFields
    );

    return responseSuccess(reply, result, "Interviews Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single interview by ID
const getSingleInterviewController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { interviewId: string };
    const result = await interviewServices.getSingleInterviewService(
      params.interviewId
    );

    return responseSuccess(reply, result, "Interview Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single interview by slug
const getSingleInterviewBySlugController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { interviewSlug: string };
    const result = await interviewServices.getSingleInterviewBySlugService(
      params.interviewSlug
    );

    return responseSuccess(
      reply,
      result,
      "Interview by Slug Fetched Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Update single interview
const updateSingleInterviewController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { interviewId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const interviewData: Partial<IInterview> = { ...data };

    const attachmentPath = await uploadService(req, "attachment");
    if (attachmentPath && typeof attachmentPath === "string") {
      interviewData.attachment = attachmentPath;
    }

    if (
      data.images === undefined ||
      (Array.isArray(data.images) && !data.images.length)
    ) {
      delete data.images;
    }

    const imageResult = await uploadService(req, "images");
    const images = Array.isArray(imageResult)
      ? imageResult
      : imageResult
      ? [imageResult]
      : [];

    if (images.length > 0) {
      interviewData.images = images;
    }

    const result = await interviewServices.updateSingleInterviewService(
      params.interviewId,
      interviewData as IInterview
    );

    return responseSuccess(reply, result, "Interview Updated Successfully!");
  } catch (error: any) {
    console.error("Update interview error:", error);
    throw error;
  }
};

// Delete single interview
const deleteSingleInterviewController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { interviewId: string };
    await interviewServices.deleteSingleInterviewService(params.interviewId);

    return responseSuccess(reply, null, "Interview Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Delete many interviews
const deleteManyInterviewsController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const interviewIds = req.body as string[];

    if (!Array.isArray(interviewIds) || interviewIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Interview IDs array provided",
        500
      );
    }

    const result = await interviewServices.deleteManyInterviewsService(
      interviewIds
    );

    return responseSuccess(
      reply,
      null,
      `Bulk Interview Delete Successful! Deleted ${result.deletedCount} Interviews.`
    );
  } catch (error: any) {
    throw error;
  }
};

export const interviewControllers = {
  createInterviewController,
  createBulkInterviewsController,
  getAllInterviewController,
  getSingleInterviewController,
  getSingleInterviewBySlugController,
  updateSingleInterviewController,
  deleteSingleInterviewController,
  deleteManyInterviewsController,
};
