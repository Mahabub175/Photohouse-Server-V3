import { FastifyInstance } from "fastify";
import { blogControllers } from "./blog.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../../global/global.interface";

export const blogRoutes = async (app: FastifyInstance) => {
  app.post(
    "/blog/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    blogControllers.createBlogController
  );

  app.post(
    "/blog/bulk/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    blogControllers.createBulkBlogsController
  );

  app.get("/blog/", blogControllers.getAllBlogController);

  app.get("/blog/:blogId/", blogControllers.getSingleBlogController);

  app.get(
    "/blog/slug/:blogSlug/",
    blogControllers.getSingleBlogBySlugController
  );

  app.patch(
    "/blog/:blogId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    blogControllers.updateSingleBlogController
  );

  app.delete(
    "/blog/:blogId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    blogControllers.deleteSingleBlogController
  );

  app.post(
    "/blog/bulk-delete/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    blogControllers.deleteManyBlogsController
  );
};
