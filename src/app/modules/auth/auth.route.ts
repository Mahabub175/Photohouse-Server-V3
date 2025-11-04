import { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../../global/global.interface";

export const authRoutes = async (app: FastifyInstance) => {
  app.post("/auth/login/", authController.loginUserController);

  app.patch(
    "/auth/change-password/",
    { preHandler: [authMiddleware(UserRole.USER || UserRole.ADMIN)] },
    authController.changeUserPasswordController
  );
};
