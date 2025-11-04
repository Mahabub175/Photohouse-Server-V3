import { FastifyInstance } from "fastify";
import { magazineControllers } from "./magazine.controller";

export const magazineRoutes = async (app: FastifyInstance) => {
  app.post("/magazine/", magazineControllers.createMagazineController);

  app.post(
    "/magazine/bulk/",
    magazineControllers.createBulkMagazinesController
  );

  app.get("/magazine/", magazineControllers.getAllMagazineController);

  app.get(
    "/magazine/:magazineId/",
    magazineControllers.getSingleMagazineController
  );

  app.patch(
    "/magazine/:magazineId/",
    magazineControllers.updateSingleMagazineController
  );

  app.delete(
    "/magazine/:magazineId/",
    magazineControllers.deleteSingleMagazineController
  );

  app.post(
    "/magazine/bulk-delete/",
    magazineControllers.deleteManyMagazinesController
  );
};
