import { FastifyInstance } from "fastify";
import { interviewControllers } from "./interview.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../../global/global.interface";

export const interviewRoutes = async (app: FastifyInstance) => {
  app.post(
    "/interview/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    interviewControllers.createInterviewController
  );

  app.post(
    "/interview/bulk/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    interviewControllers.createBulkInterviewsController
  );

  app.get("/interview/", interviewControllers.getAllInterviewController);

  app.get(
    "/interview/:interviewId/",
    interviewControllers.getSingleInterviewController
  );

  app.get(
    "/interview/slug/:interviewSlug/",
    interviewControllers.getSingleInterviewBySlugController
  );

  app.patch(
    "/interview/:interviewId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    interviewControllers.updateSingleInterviewController
  );

  app.delete(
    "/interview/:interviewId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    interviewControllers.deleteSingleInterviewController
  );

  app.post(
    "/interview/bulk-delete/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    interviewControllers.deleteManyInterviewsController
  );
};
