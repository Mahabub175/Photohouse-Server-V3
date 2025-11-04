import { FastifyInstance } from "fastify";
import { galleryControllers } from "./gallery.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../../global/global.interface";

export const galleryRoutes = async (app: FastifyInstance) => {
  app.post(
    "/gallery/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    galleryControllers.createGalleryController
  );

  app.post("/gallery/bulk/", galleryControllers.createBulkGalleriesController);

  app.get("/gallery/", galleryControllers.getAllGalleryController);

  app.get(
    "/gallery/:galleryId/",
    galleryControllers.getSingleGalleryController
  );

  app.get(
    "/gallery/slug/:gallerySlug/",
    galleryControllers.getSingleGalleryBySlugController
  );

  app.patch(
    "/gallery/:galleryId/",
    galleryControllers.updateSingleGalleryController
  );

  app.delete(
    "/gallery/:galleryId/",
    galleryControllers.deleteSingleGalleryController
  );

  app.post(
    "/gallery/bulk-delete/",
    galleryControllers.deleteManyGalleriesController
  );
};
