import { FastifyInstance } from "fastify";
import { userControllers } from "./user.controller";

export const userRoutes = async (app: FastifyInstance) => {
  app.post("/user/", userControllers.createUserController);

  app.post("/user/bulk/", userControllers.createBulkUsersController);

  app.get("/user/", userControllers.getAllUserController);

  app.get("/user/:userId/", userControllers.getSingleUserController);

  app.get(
    "/user/email/:userEmail/",
    userControllers.getSingleUserByEmailController
  );

  app.patch("/user/:userId/", userControllers.updateSingleUserController);

  app.delete("/user/:userId/", userControllers.deleteSingleUserController);

  app.post("/user/bulk-delete/", userControllers.deleteManyUsersController);
};
