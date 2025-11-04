import { FastifyRequest, FastifyReply } from "fastify";
import { galleryServices } from "./gallery.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IGallery } from "./gallery.interface";
import { parseMultipartBody } from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";

// Create a gallery
const createGalleryController = async (
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

    const result = await galleryServices.createGalleryService(
      formData as IGallery
    );

    return responseSuccess(reply, result, "Gallery Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk galleries
const createBulkGalleriesController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const galleries = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(galleries) || !galleries.length) {
      return responseError(reply, "No galleries provided", 400);
    }

    const createdGalleries = await galleryServices.createBulkGalleriesService(
      galleries
    );

    return responseSuccess(
      reply,
      createdGalleries,
      `${createdGalleries.length} galleries created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create galleries",
      500,
      err
    );
  }
};

// Get all galleries
const getAllGalleryController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as Record<string, any>;
    const pageNumber = query.page ? parseInt(query.page, 10) : undefined;
    const pageSize = query.limit ? parseInt(query.limit, 10) : undefined;
    const searchText = query.searchText as string | undefined;
    const searchFields = ["name"];
    const result = await galleryServices.getAllGalleryService(
      pageNumber,
      pageSize,
      searchText,
      searchFields
    );

    return responseSuccess(reply, result, "Galleries Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single gallery by ID
const getSingleGalleryController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { galleryId: string };
    const result = await galleryServices.getSingleGalleryService(
      params.galleryId
    );

    return responseSuccess(reply, result, "Gallery Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single gallery by slug
const getSingleGalleryBySlugController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { gallerySlug: string };
    const result = await galleryServices.getSingleGalleryBySlugService(
      params.gallerySlug
    );

    return responseSuccess(
      reply,
      result,
      "Gallery by Slug Fetched Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Update single gallery
const updateSingleGalleryController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { galleryId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const galleryData: Partial<IGallery> = { ...data };

    const attachmentPath = await uploadService(req, "attachment");
    if (attachmentPath && typeof attachmentPath === "string") {
      galleryData.attachment = attachmentPath;
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
      galleryData.images = images;
    }

    const result = await galleryServices.updateSingleGalleryService(
      params.galleryId,
      galleryData as IGallery
    );

    return responseSuccess(reply, result, "Gallery Updated Successfully!");
  } catch (error: any) {
    console.error("Update gallery error:", error);
    throw error;
  }
};

// Delete single gallery
const deleteSingleGalleryController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { galleryId: string };
    await galleryServices.deleteSingleGalleryService(params.galleryId);

    return responseSuccess(reply, null, "Gallery Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Delete many galleries
const deleteManyGalleriesController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const galleryIds = req.body as string[];

    if (!Array.isArray(galleryIds) || galleryIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Gallery IDs array provided",
        500
      );
    }

    const result = await galleryServices.deleteManyGalleriesService(galleryIds);

    return responseSuccess(
      reply,
      null,
      `Bulk Gallery Delete Successful! Deleted ${result.deletedCount} Galleries.`
    );
  } catch (error: any) {
    throw error;
  }
};

export const galleryControllers = {
  createGalleryController,
  createBulkGalleriesController,
  getAllGalleryController,
  getSingleGalleryController,
  getSingleGalleryBySlugController,
  updateSingleGalleryController,
  deleteSingleGalleryController,
  deleteManyGalleriesController,
};
