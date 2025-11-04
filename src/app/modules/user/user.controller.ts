import { FastifyRequest, FastifyReply } from "fastify";
import { userServices } from "./user.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IUser } from "./user.interface";
import { parseMultipartBody } from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";

// Create a user
const createUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const attachmentPath = await uploadService(req, "profile_image");

    const formData = {
      ...data,
      ...(attachmentPath ? { attachment: attachmentPath } : {}),
    };

    const result = await userServices.createUserService(formData as IUser);

    return responseSuccess(reply, result, "User Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk users
const createBulkUsersController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const users = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(users) || !users.length) {
      return responseError(reply, "No users provided", 400);
    }

    const createdUsers = await userServices.createBulkUsersService(users);

    return responseSuccess(
      reply,
      createdUsers,
      `${createdUsers.length} users created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create users",
      500,
      err
    );
  }
};

// Get all users
const getAllUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as Record<string, any>;
    const pageNumber = query.page ? parseInt(query.page, 10) : undefined;
    const pageSize = query.limit ? parseInt(query.limit, 10) : undefined;
    const searchText = query.searchText as string | undefined;
    const searchFields = ["name", "email", "phone_number", "role", "username"];
    const result = await userServices.getAllUserService(
      pageNumber,
      pageSize,
      searchText,
      searchFields
    );

    return responseSuccess(reply, result, "Users Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single user by ID
const getSingleUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    const result = await userServices.getSingleUserService(params.userId);

    return responseSuccess(reply, result, "User Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single user by email
const getSingleUserByEmailController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userEmail: string };
    const result = await userServices.getSingleUserByEmailService(
      params.userEmail
    );

    return responseSuccess(
      reply,
      result,
      "User by Email Fetched Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Update single user
const updateSingleUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const userData: Partial<IUser> = { ...data };

    const attachmentPath = await uploadService(req, "profile_image");
    if (attachmentPath && typeof attachmentPath === "string") {
      userData.profile_image = attachmentPath;
    }

    const result = await userServices.updateSingleUserService(
      params.userId,
      userData as IUser
    );

    return responseSuccess(reply, result, "User Updated Successfully!");
  } catch (error: any) {
    console.error("Update user error:", error);
    throw error;
  }
};

// Delete single user
const deleteSingleUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    await userServices.deleteSingleUserService(params.userId);

    return responseSuccess(reply, null, "User Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Delete many users
const deleteManyUsersController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userIds = req.body as string[];

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty User IDs array provided",
        500
      );
    }

    const result = await userServices.deleteManyUsersService(userIds);

    return responseSuccess(
      reply,
      null,
      `Bulk User Delete Successful! Deleted ${result.deletedCount} Users.`
    );
  } catch (error: any) {
    throw error;
  }
};

export const userControllers = {
  createUserController,
  createBulkUsersController,
  getAllUserController,
  getSingleUserController,
  getSingleUserByEmailController,
  updateSingleUserController,
  deleteSingleUserController,
  deleteManyUsersController,
};
