import { FastifyRequest, FastifyReply } from "fastify";
import { magazineServices } from "./magazine.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IMagazine } from "./magazine.interface";
import { parseMultipartBody } from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";

// Create a magazine
const createMagazineController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const attachmentPath = await uploadService(req, "attachment");

    const formData = {
      ...data,
      ...(attachmentPath ? { attachment: attachmentPath } : {}),
    };

    const result = await magazineServices.createMagazineService(
      formData as IMagazine
    );

    return responseSuccess(reply, result, "Magazine Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk magazines
const createBulkMagazinesController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const magazines = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(magazines) || !magazines.length) {
      return responseError(reply, "No magazines provided", 400);
    }

    const createdMagazines = await magazineServices.createBulkMagazinesService(
      magazines
    );

    return responseSuccess(
      reply,
      createdMagazines,
      `${createdMagazines.length} magazines created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create magazines",
      500,
      err
    );
  }
};

// Get all magazines
const getAllMagazineController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as Record<string, any>;
    const pageNumber = query.page ? parseInt(query.page, 10) : undefined;
    const pageSize = query.limit ? parseInt(query.limit, 10) : undefined;
    const searchText = query.searchText as string | undefined;
    const searchFields = ["name"];
    const result = await magazineServices.getAllMagazineService(
      pageNumber,
      pageSize,
      searchText,
      searchFields
    );

    return responseSuccess(reply, result, "Magazines Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single magazine by ID
const getSingleMagazineController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { magazineId: string };
    const result = await magazineServices.getSingleMagazineService(
      params.magazineId
    );

    return responseSuccess(reply, result, "Magazine Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Update single magazine
const updateSingleMagazineController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { magazineId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const magazineData: Partial<IMagazine> = { ...data };

    const attachmentPath = await uploadService(req, "attachment");
    if (attachmentPath && typeof attachmentPath === "string") {
      magazineData.attachment = attachmentPath;
    }

    const imageResult = await uploadService(req, "images");
    const images = Array.isArray(imageResult)
      ? imageResult
      : imageResult
      ? [imageResult]
      : [];

    const result = await magazineServices.updateSingleMagazineService(
      params.magazineId,
      magazineData as IMagazine
    );

    return responseSuccess(reply, result, "Magazine Updated Successfully!");
  } catch (error: any) {
    console.error("Update magazine error:", error);
    throw error;
  }
};

// Delete single magazine
const deleteSingleMagazineController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { magazineId: string };
    await magazineServices.deleteSingleMagazineService(params.magazineId);

    return responseSuccess(reply, null, "Magazine Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Delete many magazines
const deleteManyMagazinesController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const magazineIds = req.body as string[];

    if (!Array.isArray(magazineIds) || magazineIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Magazine IDs array provided",
        500
      );
    }

    const result = await magazineServices.deleteManyMagazinesService(
      magazineIds
    );

    return responseSuccess(
      reply,
      null,
      `Bulk Magazine Delete Successful! Deleted ${result.deletedCount} Magazines.`
    );
  } catch (error: any) {
    throw error;
  }
};

export const magazineControllers = {
  createMagazineController,
  createBulkMagazinesController,
  getAllMagazineController,
  getSingleMagazineController,
  updateSingleMagazineController,
  deleteSingleMagazineController,
  deleteManyMagazinesController,
};
