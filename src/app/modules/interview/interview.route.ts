import { FastifyInstance } from "fastify";
import { interviewControllers } from "./interview.controller";

export const interviewRoutes = async (app: FastifyInstance) => {
  app.post("/interview/", interviewControllers.createInterviewController);

  app.post(
    "/interview/bulk/",
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
    interviewControllers.updateSingleInterviewController
  );

  app.delete(
    "/interview/:interviewId/",
    interviewControllers.deleteSingleInterviewController
  );

  app.post(
    "/interview/bulk-delete/",
    interviewControllers.deleteManyInterviewsController
  );
};
