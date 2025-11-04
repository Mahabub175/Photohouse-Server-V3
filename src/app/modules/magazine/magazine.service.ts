import mongoose from "mongoose";
import { IMagazine } from "./magazine.interface";
import { throwError } from "../../utils/response";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { magazineModel } from "./magazine.model";
import { formatResultImage } from "../../utils/formatResultImage";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";

const createMagazineService = async (magazineData: IMagazine) => {
  const result = await magazineModel.create(magazineData);
  return result;
};

export const createBulkMagazinesService = async (
  magazines: Partial<IMagazine>[]
) => {
  if (!magazines || magazines.length === 0)
    throwError("No magazines provided", 400);
  const result = await magazineModel.insertMany(magazines, { ordered: false });
  return result;
};

const getAllMagazineService = async (
  page?: number,
  limit?: number,
  searchText?: string,
  searchFields?: string[]
) => {
  let query = magazineModel.find();

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
    result.results = formatResultImage<IMagazine>(result.results, [
      "attachment",
    ]) as unknown as typeof result.results;
    return result;
  }

  const results = await query.sort({ createdAt: -1 }).exec();
  return {
    results: formatResultImage<IMagazine>(results, [
      "attachment",
    ]) as IMagazine[],
  };
};

export const getSingleMagazineService = async (magazineId: string) => {
  const queryId = new mongoose.Types.ObjectId(magazineId);

  const magazine = await magazineModel.findById(queryId).exec();

  if (!magazine) throwError("Magazine not found", 404);
  else {
    const result = magazine.toObject() as IMagazine;
    if (result.attachment)
      result.attachment = formatResultImage(result.attachment) as string;
    return result;
  }
};

export const updateSingleMagazineService = async (
  magazineId: string,
  magazineData: Partial<IMagazine>
) => {
  const queryId = new mongoose.Types.ObjectId(magazineId);
  const magazine = await magazineModel.findById(queryId).exec();

  if (!magazine) throwError("Magazine not found", 404);
  else {
    Object.keys(magazineData).forEach((key) =>
      magazineData[key as keyof IMagazine] === undefined ||
      magazineData[key as keyof IMagazine] === null
        ? delete magazineData[key as keyof IMagazine]
        : null
    );

    if (
      magazineData.attachment &&
      magazine.attachment &&
      magazineData.attachment !== magazine.attachment
    ) {
      deleteFileSync(magazine.attachment);
    }
  }
  const updatedMagazine = await magazineModel
    .findByIdAndUpdate(
      queryId,
      { $set: magazineData },
      { new: true, runValidators: true, context: "query" }
    )
    .exec();

  if (!updatedMagazine) throwError("Magazine update failed", 500);
  else {
    const result = updatedMagazine.toObject() as IMagazine;
    if (result.attachment)
      result.attachment = formatResultImage(result.attachment) as string;
    return result;
  }
};

export const deleteSingleMagazineService = async (magazineId: string) => {
  const queryId = new mongoose.Types.ObjectId(magazineId);
  const magazine = await magazineModel.findById(queryId).exec();

  if (!magazine) throwError("Magazine not found", 404);
  else {
    if (magazine.attachment) deleteFileSync(magazine.attachment);

    const deleted = await magazineModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Magazine delete failed", 500);
    return deleted;
  }
};

export const deleteManyMagazinesService = async (magazineIds: string[]) => {
  if (!Array.isArray(magazineIds) || magazineIds.length === 0)
    throwError("No magazine IDs provided", 400);

  const queryIds = magazineIds.map((id) => new mongoose.Types.ObjectId(id));
  const magazines = await magazineModel.find({ _id: { $in: queryIds } }).exec();

  for (const magazine of magazines) {
    if (magazine.attachment) deleteFileSync(magazine.attachment);
  }

  const result = await magazineModel
    .deleteMany({ _id: { $in: queryIds } })
    .exec();
  return result;
};

export const magazineServices = {
  createMagazineService,
  createBulkMagazinesService,
  getAllMagazineService,
  getSingleMagazineService,
  updateSingleMagazineService,
  deleteSingleMagazineService,
  deleteManyMagazinesService,
};
