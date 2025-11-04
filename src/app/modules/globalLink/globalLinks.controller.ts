import { FastifyRequest, FastifyReply } from "fastify";
import { globalLinksServices } from "./globalLinks.service";
import { responseSuccess, responseError } from "../../utils/response";
import { parseMultipartBody } from "../../utils/parsedBodyData";
import { IGlobalLinks } from "./globalLinks.interface";

const createGlobalLinksController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);
    const result = await globalLinksServices.createGlobalLinksService(
      data as IGlobalLinks
    );
    return responseSuccess(reply, result, "Global Links created successfully");
  } catch (error: any) {
    return responseError(reply, error.message, 500, error);
  }
};

const getAllGlobalLinksController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = await globalLinksServices.getAllGlobalLinksService();
    return responseSuccess(reply, result, "Global Links fetched successfully");
  } catch (error: any) {
    return responseError(reply, error.message, 500, error);
  }
};

const getSingleGlobalLinksController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { globalLinksId: string };
    const result = await globalLinksServices.getSingleGlobalLinksService(
      params.globalLinksId
    );
    return responseSuccess(reply, result, "Global Links fetched successfully");
  } catch (error: any) {
    return responseError(reply, error.message, 404, error);
  }
};

const updateGlobalLinksController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { globalLinksId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const result = await globalLinksServices.updateGlobalLinksService(
      params.globalLinksId,
      data as IGlobalLinks
    );
    return responseSuccess(reply, result, "Global Links updated successfully");
  } catch (error: any) {
    return responseError(reply, error.message, 404, error);
  }
};

export const globalLinksControllers = {
  createGlobalLinksController,
  getAllGlobalLinksController,
  getSingleGlobalLinksController,
  updateGlobalLinksController,
};
