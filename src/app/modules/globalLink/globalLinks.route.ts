import { FastifyInstance } from "fastify";
import { globalLinksControllers } from "./globalLinks.controller";

export const globalLinksRoutes = async (app: FastifyInstance) => {
  app.post(
    "/global-links/",
    globalLinksControllers.createGlobalLinksController
  );

  app.get("/global-links/", globalLinksControllers.getAllGlobalLinksController);

  app.get(
    "/global-links/:globalLinksId/",
    globalLinksControllers.getSingleGlobalLinksController
  );

  app.patch(
    "/global-links/:globalLinksId/",
    globalLinksControllers.updateGlobalLinksController
  );
};
