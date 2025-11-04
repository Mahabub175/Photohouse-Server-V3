import { FastifyInstance } from "fastify";
import { mediaControllers } from "./media.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../../global/global.interface";

export const mediaRoutes = async (app: FastifyInstance) => {
  app.post(
    "/media/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    mediaControllers.createMediaController
  );

  app.post(
    "/media/bulk/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    mediaControllers.createBulkMediasController
  );

  app.get("/media/", mediaControllers.getAllMediasController);

  app.get("/media/:mediaId/", mediaControllers.getSingleMediaController);

  app.get(
    "/media/slug/:mediaSlug/",
    mediaControllers.getSingleMediaBySlugController
  );

  app.patch(
    "/media/:mediaId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    mediaControllers.updateSingleMediaController
  );

  app.delete(
    "/media/:mediaId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    mediaControllers.deleteSingleMediaController
  );

  app.post(
    "/media/bulk-delete/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    mediaControllers.deleteManyMediasController
  );
};
