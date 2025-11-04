import mongoose from "mongoose";
import { IMedia } from "./media.interface";
import { mediaModel } from "./media.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { formatResultImage } from "../../utils/formatResultImage";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";

// Create media
export const createMediaService = async (mediaData: IMedia) => {
  const result = await mediaModel.create(mediaData);
  return result;
};

// Create bulk medias
export const createBulkMediasService = async (medias: Partial<IMedia>[]) => {
  if (!medias || !medias.length) throwError("No medias provided", 400);
  const result = await mediaModel.insertMany(medias);
  return result;
};

// Get all medias
export const getAllMediasService = async (
  page?: number,
  limit?: number,
  searchText?: string,
  searchFields?: string[]
) => {
  let query = mediaModel.find();

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

    result.results = formatResultImage<IMedia>(result.results, [
      "image",
      "artists.image",
      "flag",
    ]) as unknown as typeof result.results;

    return result;
  }

  const results = await query.sort({ createdAt: -1 }).exec();
  return {
    results: formatResultImage<IMedia>(results, [
      "image",
      "artists.image",
      "flag",
    ]) as IMedia[],
  };
};

// Get single media
export const getSingleMediaService = async (slug: string) => {
  const media = await mediaModel.findOne({ slug }).exec();

  if (!media) throwError("Media not found", 404);
  else {
    const mediaObj = media.toObject() as IMedia;

    if (mediaObj.image)
      mediaObj.image = formatResultImage(mediaObj.image) as string;
    if (mediaObj.flag)
      mediaObj.flag = formatResultImage(mediaObj.flag) as string;

    if (mediaObj.artists?.length) {
      mediaObj.artists = mediaObj.artists.map((artist) => ({
        ...artist,
        image: artist.image
          ? (formatResultImage(artist.image) as string)
          : artist.image,
      }));
    }

    return mediaObj;
  }
};

// Get single media
export const getSingleMediaBySlugService = async (mediaId: string) => {
  const queryId =
    typeof mediaId === "string"
      ? new mongoose.Types.ObjectId(mediaId)
      : mediaId;

  const media = await mediaModel.findById(queryId).exec();
  if (!media) throwError("Media not found", 404);
  else {
    const mediaObj = media.toObject() as IMedia;

    if (mediaObj.image)
      mediaObj.image = formatResultImage(mediaObj.image) as string;

    if (mediaObj.artists?.length) {
      mediaObj.artists = mediaObj.artists.map((artist) => ({
        ...artist,
        image: artist.image
          ? (formatResultImage(artist.image) as string)
          : artist.image,
      }));
    }

    return mediaObj;
  }
};

// Update single media
export const updateSingleMediaService = async (
  mediaId: string,
  mediaData: Partial<IMedia>
) => {
  const queryId =
    typeof mediaId === "string"
      ? new mongoose.Types.ObjectId(mediaId)
      : mediaId;

  const media = await mediaModel.findById(queryId).exec();
  if (!media) throwError("Media not found", 404);
  else {
    Object.keys(mediaData).forEach((key) => {
      if (
        mediaData[key as keyof IMedia] === undefined ||
        mediaData[key as keyof IMedia] === null
      ) {
        delete mediaData[key as keyof IMedia];
      }
    });

    if (mediaData.image && media.image && mediaData.image !== media.image) {
      deleteFileSync(media.image);
    }

    if (mediaData.artists) {
      const removedArtists = media.artists.filter(
        (artist) =>
          !mediaData.artists!.some(
            (a: any) => a._id?.toString() === artist._id?.toString()
          )
      );
      for (const artist of removedArtists) {
        if (artist.image) deleteFileSync(artist.image);
      }

      for (const newArtist of mediaData.artists) {
        const oldArtist = media.artists.find(
          (a: any) => a._id?.toString() === newArtist._id?.toString()
        );
        if (
          oldArtist &&
          newArtist.image &&
          newArtist.image !== oldArtist.image
        ) {
          deleteFileSync(oldArtist.image);
        }
      }
    }

    const updated = await mediaModel
      .findByIdAndUpdate(
        queryId,
        { $set: mediaData },
        { new: true, runValidators: true, context: "query" }
      )
      .exec();

    if (!updated) throwError("Media update failed", 500);
    return updated;
  }
};

// Delete single media
export const deleteSingleMediaService = async (mediaId: string) => {
  const queryId =
    typeof mediaId === "string"
      ? new mongoose.Types.ObjectId(mediaId)
      : mediaId;

  const media = await mediaModel.findById(queryId).exec();
  if (!media) throwError("Media not found", 404);
  else {
    if (media.image) deleteFileSync(media.image);

    if (media.artists?.length) {
      for (const artist of media.artists) {
        if (artist.image) deleteFileSync(artist.image);
      }
    }

    const deleted = await mediaModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Media delete failed", 500);

    return deleted;
  }
};

// Delete many medias
export const deleteManyMediasService = async (
  mediaIds: (string | number)[]
) => {
  const queryIds = mediaIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const medias = await mediaModel.find({ _id: { $in: queryIds } }).exec();

  for (const media of medias) {
    if (media.image) deleteFileSync(media.image);

    if (media.artists?.length) {
      for (const artist of media.artists) {
        if (artist.image) deleteFileSync(artist.image);
        if (artist.flag) deleteFileSync(artist.flag);
      }
    }
  }

  const result = await mediaModel.deleteMany({ _id: { $in: queryIds } }).exec();
  return result;
};

export const mediaServices = {
  createMediaService,
  createBulkMediasService,
  getAllMediasService,
  getSingleMediaService,
  getSingleMediaBySlugService,
  updateSingleMediaService,
  deleteSingleMediaService,
  deleteManyMediasService,
};
