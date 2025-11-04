import { FastifyInstance } from "fastify";
import { globalLinksControllers } from "./globalLinks.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../../global/global.interface";

export const globalLinksRoutes = async (app: FastifyInstance) => {
  app.post(
    "/global-links/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    globalLinksControllers.createGlobalLinksController
  );

  app.get("/global-links/", globalLinksControllers.getAllGlobalLinksController);

  app.get(
    "/global-links/:globalLinksId/",
    globalLinksControllers.getSingleGlobalLinksController
  );

  app.patch(
    "/global-links/:globalLinksId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    globalLinksControllers.updateGlobalLinksController
  );
};
