import mongoose from "mongoose";
import { IUser } from "./user.interface";
import { throwError } from "../../utils/response";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { userModel } from "./user.model";
import { UserRole } from "../../global/global.interface";
import { formatResultImage } from "../../utils/formatResultImage";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";
import { hashPassword } from "../../utils/passwordUtils";

const createUserService = async (userData: IUser) => {
  const existingUser = await userModel.findOne({
    $or: [{ email: userData.email }, { username: userData.username }],
  });
  if (existingUser) throwError("User already exists", 400);

  const hashedPassword = await hashPassword(userData.password);

  const user = new userModel({
    ...userData,
    password: hashedPassword,
    role: UserRole.USER,
  });

  const savedUser = await user.save();
  const { password, ...result } = savedUser.toObject() as IUser;

  if (result.profile_image) {
    result.profile_image = formatResultImage(result.profile_image) as string;
  }

  return result;
};

export const createBulkUsersService = async (users: Partial<IUser>[]) => {
  if (!users || users.length === 0) throwError("No users provided", 400);
  const result = await userModel.insertMany(users, { ordered: false });
  return result;
};

const getAllUserService = async (
  page?: number,
  limit?: number,
  searchText?: string,
  searchFields?: string[]
) => {
  let query = userModel.find();

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
    result.results = formatResultImage<IUser>(result.results, [
      "profile_image",
    ]) as unknown as typeof result.results;
    return result;
  }

  const results = await query.sort({ createdAt: -1 }).exec();
  return {
    results: formatResultImage<IUser>(results, ["profile_image"]) as IUser[],
  };
};

export const getSingleUserService = async (userId: string) => {
  const queryId = new mongoose.Types.ObjectId(userId);

  const user = await userModel.findById(queryId).exec();

  if (!user) throwError("User not found", 404);
  else {
    const result = user.toObject() as IUser;
    if (result.profile_image)
      result.profile_image = formatResultImage(result.profile_image) as string;
    return result;
  }
};

export const getSingleUserByEmailService = async (email: string) => {
  const user = await userModel.findOne({ email }).exec();

  if (!user) throwError("User not found", 404);
  else {
    const result = user.toObject() as IUser;
    if (result.profile_image)
      result.profile_image = formatResultImage(result.profile_image) as string;
    return result;
  }
};

export const updateSingleUserService = async (
  userId: string,
  userData: Partial<IUser>
) => {
  const queryId = new mongoose.Types.ObjectId(userId);
  const user = await userModel.findById(queryId).exec();

  if (!user) throwError("User not found", 404);
  else {
    Object.keys(userData).forEach((key) =>
      userData[key as keyof IUser] === undefined ||
      userData[key as keyof IUser] === null
        ? delete userData[key as keyof IUser]
        : null
    );

    if (
      userData.profile_image &&
      user.profile_image &&
      userData.profile_image !== user.profile_image
    ) {
      deleteFileSync(user.profile_image);
    }
  }
  const updatedUser = await userModel
    .findByIdAndUpdate(
      queryId,
      { $set: userData },
      { new: true, runValidators: true, context: "query" }
    )
    .exec();

  if (!updatedUser) throwError("User update failed", 500);
  else {
    const result = updatedUser.toObject() as IUser;
    if (result.profile_image)
      result.profile_image = formatResultImage(result.profile_image) as string;
    return result;
  }
};

export const deleteSingleUserService = async (userId: string) => {
  const queryId = new mongoose.Types.ObjectId(userId);
  const user = await userModel.findById(queryId).exec();

  if (!user) throwError("User not found", 404);
  else {
    if (user.profile_image) deleteFileSync(user.profile_image);

    const deleted = await userModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("User delete failed", 500);
    return deleted;
  }
};

export const deleteManyUsersService = async (userIds: string[]) => {
  if (!Array.isArray(userIds) || userIds.length === 0)
    throwError("No user IDs provided", 400);

  const queryIds = userIds.map((id) => new mongoose.Types.ObjectId(id));
  const users = await userModel.find({ _id: { $in: queryIds } }).exec();

  for (const user of users) {
    if (user.profile_image) deleteFileSync(user.profile_image);
  }

  const result = await userModel.deleteMany({ _id: { $in: queryIds } }).exec();
  return result;
};

export const userServices = {
  createUserService,
  createBulkUsersService,
  getAllUserService,
  getSingleUserService,
  getSingleUserByEmailService,
  updateSingleUserService,
  deleteSingleUserService,
  deleteManyUsersService,
};
