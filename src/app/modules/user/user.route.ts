import { FastifyInstance } from "fastify";
import { userControllers } from "./user.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../../global/global.interface";

export const userRoutes = async (app: FastifyInstance) => {
  app.post("/user/", userControllers.createUserController);

  app.post("/user/bulk/", userControllers.createBulkUsersController);

  app.get("/user/", userControllers.getAllUserController);

  app.get("/user/:userId/", userControllers.getSingleUserController);

  app.get(
    "/user/email/:userEmail/",
    userControllers.getSingleUserByEmailController
  );

  app.patch(
    "/user/:userId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    userControllers.updateSingleUserController
  );

  app.delete(
    "/user/:userId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    userControllers.deleteSingleUserController
  );

  app.post(
    "/user/bulk-delete/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    userControllers.deleteManyUsersController
  );
};
