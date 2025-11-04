import { FastifyInstance } from "fastify";
import { mediaControllers } from "./media.controller";

export const mediaRoutes = async (app: FastifyInstance) => {
  app.post("/media/", mediaControllers.createMediaController);

  app.post("/media/bulk/", mediaControllers.createBulkMediasController);

  app.get("/media/", mediaControllers.getAllMediasController);

  app.get("/media/:mediaId/", mediaControllers.getSingleMediaController);

  app.get(
    "/media/slug/:mediaSlug/",
    mediaControllers.getSingleMediaBySlugController
  );

  app.patch("/media/:mediaId/", mediaControllers.updateSingleMediaController);

  app.delete("/media/:mediaId/", mediaControllers.deleteSingleMediaController);

  app.post("/media/bulk-delete/", mediaControllers.deleteManyMediasController);
};
