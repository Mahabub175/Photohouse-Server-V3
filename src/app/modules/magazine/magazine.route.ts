import { FastifyInstance } from "fastify";
import { magazineControllers } from "./magazine.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../../global/global.interface";

export const magazineRoutes = async (app: FastifyInstance) => {
  app.post(
    "/magazine/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    magazineControllers.createMagazineController
  );

  app.post(
    "/magazine/bulk/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    magazineControllers.createBulkMagazinesController
  );

  app.get("/magazine/", magazineControllers.getAllMagazineController);

  app.get(
    "/magazine/:magazineId/",
    magazineControllers.getSingleMagazineController
  );

  app.patch(
    "/magazine/:magazineId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    magazineControllers.updateSingleMagazineController
  );

  app.delete(
    "/magazine/:magazineId/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    magazineControllers.deleteSingleMagazineController
  );

  app.post(
    "/magazine/bulk-delete/",
    { preHandler: [authMiddleware(UserRole.ADMIN)] },
    magazineControllers.deleteManyMagazinesController
  );
};
