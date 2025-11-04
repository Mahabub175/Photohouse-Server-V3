import mongoose from "mongoose";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { globalLinksModel } from "./globalLinks.model";
import { IGlobalLinks } from "./globalLinks.interface";

const createGlobalLinksService = async (globalLinksData: IGlobalLinks) => {
  const dataToSave = { ...globalLinksData };
  const result = await globalLinksModel.create(dataToSave);
  return result;
};

const getAllGlobalLinksService = async () => {
  let results;

  results = await globalLinksModel.find().exec();

  const singleResult = results[0];

  return {
    singleResult,
  };
};

const getSingleGlobalLinksService = async (globalLinksId: number | string) => {
  const queryId =
    typeof globalLinksId === "string"
      ? new mongoose.Types.ObjectId(globalLinksId)
      : globalLinksId;

  const result = await globalLinksModel.findById(queryId).exec();
  if (!result) {
    throw new Error("link not found");
  }

  return result;
};

const updateGlobalLinksService = async (
  globalLinksId: string | number,
  globalLinksData: IGlobalLinks
) => {
  const queryId =
    typeof globalLinksId === "string"
      ? new mongoose.Types.ObjectId(globalLinksId)
      : globalLinksId;

  const result = await globalLinksModel
    .findByIdAndUpdate(
      queryId,
      { $set: globalLinksData },
      { new: true, runValidators: true }
    )
    .exec();

  if (!result) {
    throw new Error("links not found");
  }

  return result;
};

export const globalLinksServices = {
  createGlobalLinksService,
  getAllGlobalLinksService,
  getSingleGlobalLinksService,
  updateGlobalLinksService,
};
