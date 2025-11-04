import { FastifyRequest, FastifyReply } from "fastify";
import { mediaServices } from "./media.service";
import { responseError, responseSuccess } from "../../utils/response";
import { parseMultipartBody } from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";
import { IMedia } from "./media.interface";

// Create a media
const createMediaController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const mainImagePath = await uploadService(req, "image");

    let artists = [];
    if (data.artists) {
      artists =
        typeof data.artists === "string"
          ? JSON.parse(data.artists)
          : data.artists;
    }

    if (Array.isArray(artists) && artists.length > 0) {
      for (let i = 0; i < artists.length; i++) {
        const artistImagePath = await uploadService(
          req,
          `artists[${i}][image]`
        );
        const artistFlagPath = await uploadService(req, `artists[${i}][flag]`);

        if (artistImagePath) artists[i].image = artistImagePath;
        if (artistFlagPath) artists[i].flag = artistFlagPath;
      }
    }

    const formData = {
      ...data,
      ...(mainImagePath ? { image: mainImagePath } : {}),
      ...(artists.length ? { artists } : {}),
    };

    const result = await mediaServices.createMediaService(formData as IMedia);

    return responseSuccess(reply, result, "Media Created Successfully");
  } catch (error: any) {
    return responseError(
      reply,
      error.message || "Failed to create media",
      500,
      error
    );
  }
};

// Create bulk medias
const createBulkMediasController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const medias = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(medias) || !medias.length) {
      return responseError(reply, "No medias provided", 400);
    }

    const createdMedias = await mediaServices.createBulkMediasService(medias);

    return responseSuccess(
      reply,
      createdMedias,
      `${createdMedias.length} medias created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create medias",
      500,
      err
    );
  }
};

// Get all media
const getAllMediasController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as Record<string, any>;
    const pageNumber = query.page ? parseInt(query.page, 10) : undefined;
    const pageSize = query.limit ? parseInt(query.limit, 10) : undefined;
    const searchText = query.searchText as string | undefined;
    const searchFields = ["artists.name", "click"];
    const result = await mediaServices.getAllMediasService(
      pageNumber,
      pageSize,
      searchText,
      searchFields
    );

    return responseSuccess(reply, result, "Media Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single media by ID
const getSingleMediaController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { mediaId: string };
    const result = await mediaServices.getSingleMediaService(params.mediaId);

    return responseSuccess(reply, result, "Media Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

const getSingleMediaBySlugController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { mediaSlug: string };
    const result = await mediaServices.getSingleMediaBySlugService(
      params.mediaSlug
    );

    return responseSuccess(reply, result, "Media Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Update single media
const updateSingleMediaController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { mediaId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);

    const mediaData: Partial<IMedia> = { ...data };

    const mainImagePath = await uploadService(req, "image");
    if (mainImagePath && typeof mainImagePath === "string") {
      mediaData.image = mainImagePath;
    }

    let artists = [];
    if (data.artists) {
      artists =
        typeof data.artists === "string"
          ? JSON.parse(data.artists)
          : data.artists;

      for (let i = 0; i < artists.length; i++) {
        const artistImagePath = await uploadService(
          req,
          `artists[${i}][image]`
        );
        const artistFlagPath = await uploadService(req, `artists[${i}][flag]`);

        if (artistImagePath) artists[i].image = artistImagePath;
        if (artistFlagPath) artists[i].flag = artistFlagPath;
      }
    }

    if (artists.length > 0) {
      mediaData.artists = artists;
    }

    const result = await mediaServices.updateSingleMediaService(
      params.mediaId,
      mediaData as IMedia
    );

    return responseSuccess(reply, result, "Media Updated Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Delete single media
const deleteSingleMediaController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { mediaId: string };
    await mediaServices.deleteSingleMediaService(params.mediaId);

    return responseSuccess(reply, null, "Media Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Delete many media
const deleteManyMediasController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const mediaIds = req.body as string[];

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Media IDs array provided",
        500
      );
    }

    const result = await mediaServices.deleteManyMediasService(mediaIds);

    return responseSuccess(
      reply,
      null,
      `Bulk Media Delete Successful! Deleted ${result.deletedCount} Media.`
    );
  } catch (error: any) {
    throw error;
  }
};

export const mediaControllers = {
  createMediaController,
  createBulkMediasController,
  getAllMediasController,
  getSingleMediaController,
  getSingleMediaBySlugController,
  updateSingleMediaController,
  deleteSingleMediaController,
  deleteManyMediasController,
};
