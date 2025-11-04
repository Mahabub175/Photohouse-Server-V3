import { FastifyInstance } from "fastify";
import { blogRoutes } from "../modules/blog/blog.route";
import { uploadRoutes } from "../modules/upload/upload.route";
import { userRoutes } from "../modules/user/user.route";
import { galleryRoutes } from "../modules/gallery/gallery.route";
import { authRoutes } from "../modules/auth/auth.route";
import { magazineRoutes } from "../modules/magazine/magazine.route";
import { interviewRoutes } from "../modules/interview/interview.route";
import { mediaRoutes } from "../modules/media/media.route";
import { globalLinksRoutes } from "../modules/globalLink/globalLinks.route";

export const router = async (app: FastifyInstance) => {
  // Route Paths
  const routes = [
    blogRoutes,
    uploadRoutes,
    userRoutes,
    authRoutes,
    galleryRoutes,
    magazineRoutes,
    interviewRoutes,
    mediaRoutes,
    globalLinksRoutes,
  ];

  for (const route of routes) {
    await route(app);
  }
};
