import mongoose from "mongoose";
import { IGallery } from "./gallery.interface";
import { galleryModel } from "./gallery.model";
import path from "path";
import fs from "fs";
import { generateSlug } from "../../utils/generateSlug";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { formatResultImage } from "../../utils/formatResultImage";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";

// Create a gallery
export const createGalleryService = async (galleryData: IGallery) => {
  const dataToSave = { ...galleryData };

  const result = await galleryModel.create(dataToSave);
  return result;
};

// Create bulk galleries
const createBulkGalleriesService = async (galleries: Partial<IGallery>[]) => {
  if (!galleries || !galleries.length) throw new Error("No galleries provided");

  const result = await galleryModel.insertMany(galleries);
  return result;
};

// Get all galleries with optional pagination & search
const getAllGalleryService = async (
  page?: number,
  limit?: number,
  searchText?: string,
  searchFields?: string[]
) => {
  let query = galleryModel.find();

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

    result.results = formatResultImage<IGallery>(result.results, [
      "attachment",
      "images",
    ]) as unknown as typeof result.results;

    return result;
  }

  const results = await query.sort({ createdAt: -1 }).exec();
  return {
    results: formatResultImage<IGallery>(results, [
      "attachment",
      "images",
    ]) as IGallery[],
  };
};

// Get single gallery by ID
const getSingleGalleryService = async (galleryId: string) => {
  const queryId =
    typeof galleryId === "string"
      ? new mongoose.Types.ObjectId(galleryId)
      : galleryId;

  const gallery = await galleryModel.findById(queryId).exec();
  if (!gallery) throwError("Gallery not found", 404);
  else {
    const galleryObj = gallery.toObject() as IGallery;

    if (galleryObj.attachment) {
      galleryObj.attachment = formatResultImage(
        galleryObj.attachment
      ) as string;
    }

    if (galleryObj.images && galleryObj.images.length > 0) {
      galleryObj.images = galleryObj.images.map(
        (img) => formatResultImage(img) as string
      );
    }

    return galleryObj;
  }
};

// Get single gallery by slug
const getSingleGalleryBySlugService = async (slug: string) => {
  const gallery = await galleryModel.findOne({ slug }).exec();
  if (!gallery) throwError("Gallery not found", 404);
  else {
    const galleryObj = gallery.toObject() as IGallery;

    if (galleryObj.attachment) {
      galleryObj.attachment = formatResultImage(
        galleryObj.attachment
      ) as string;
    }

    if (galleryObj.images && galleryObj.images.length > 0) {
      galleryObj.images = galleryObj.images.map(
        (img) => formatResultImage(img) as string
      );
    }

    return galleryObj;
  }
};

// Update single gallery
export const updateSingleGalleryService = async (
  galleryId: string | number,
  galleryData: Partial<IGallery>
) => {
  const queryId =
    typeof galleryId === "string"
      ? new mongoose.Types.ObjectId(galleryId)
      : galleryId;

  const gallery = await galleryModel.findById(queryId).exec();
  if (!gallery) throwError("Gallery not found", 404);
  else {
    Object.keys(galleryData).forEach((key) =>
      galleryData[key as keyof IGallery] === undefined ||
      galleryData[key as keyof IGallery] === null
        ? delete galleryData[key as keyof IGallery]
        : null
    );

    if (
      galleryData.attachment &&
      gallery.attachment &&
      galleryData.attachment !== gallery.attachment
    ) {
      deleteFileSync(gallery.attachment);
    }

    if (
      galleryData.images &&
      galleryData.images.length > 0 &&
      gallery.images?.length
    ) {
      for (const oldImg of gallery.images) {
        deleteFileSync(oldImg);
      }
    }

    const updated = await galleryModel
      .findByIdAndUpdate(
        queryId,
        { $set: galleryData },
        { new: true, runValidators: true, context: "query" }
      )
      .exec();

    if (!updated) throwError("Gallery update failed", 500);

    return updated;
  }
};

// Delete single gallery
export const deleteSingleGalleryService = async (
  galleryId: string | number
) => {
  const queryId =
    typeof galleryId === "string"
      ? new mongoose.Types.ObjectId(galleryId)
      : galleryId;

  const gallery = await galleryModel.findById(queryId).exec();
  if (!gallery) throwError("Gallery not found", 404);
  else {
    if (gallery.attachment) deleteFileSync(gallery.attachment);

    if (gallery.images && gallery.images.length > 0) {
      for (const img of gallery.images) deleteFileSync(img);
    }

    const deleted = await galleryModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Gallery delete failed", 500);

    return deleted;
  }
};

// Delete many galleries
export const deleteManyGalleriesService = async (
  galleryIds: (string | number)[]
) => {
  const queryIds = galleryIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const galleries = await galleryModel.find({ _id: { $in: queryIds } }).exec();

  for (const gallery of galleries) {
    if (gallery.attachment) deleteFileSync(gallery.attachment);
    if (gallery.images && gallery.images.length > 0) {
      for (const img of gallery.images) deleteFileSync(img);
    }
  }

  const result = await galleryModel
    .deleteMany({ _id: { $in: queryIds } })
    .exec();
  return result;
};

export const galleryServices = {
  createGalleryService,
  createBulkGalleriesService,
  getAllGalleryService,
  getSingleGalleryService,
  getSingleGalleryBySlugService,
  updateSingleGalleryService,
  deleteSingleGalleryService,
  deleteManyGalleriesService,
};
