import { FastifyReply, FastifyRequest } from "fastify";
import { parseMultipartBody } from "../../utils/parsedBodyData";
import { responseSuccess, throwError } from "../../utils/response";
import { authServices } from "./auth.service";

const loginUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const formData = {
      ...data,
    };

    const result = await authServices.loginUserService(formData);

    return responseSuccess(reply, result, "User Logged in Successfully!");
  } catch (error: any) {
    throwError(error.message, error.statusCode);
  }
};

const changeUserPasswordController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const userData = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    const userId = (req.user as any)?._id || (req.params as any).userId;

    const updatedUser = await authServices.changeUserPasswordService(
      userId,
      userData
    );

    return responseSuccess(reply, updatedUser, "Password changed successfully");
  } catch (error: any) {
    throwError(error.message, error.statusCode);
  }
};

export const authController = {
  loginUserController,
  changeUserPasswordController,
};
