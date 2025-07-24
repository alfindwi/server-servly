
import * as serviceController from "../controller/servController";
import { Router } from "express";
import { authentication } from "../middlewares/auth";
import { isAdmin } from "../middlewares/isAdmin";

export const serviceRouter = Router();

serviceRouter.get("/", authentication ,serviceController.getService);
serviceRouter.get("/:id", authentication ,serviceController.getServiceById);
serviceRouter.post("/", authentication, isAdmin ,serviceController.createService);
serviceRouter.put("/:id", authentication, isAdmin ,serviceController.updateService);
serviceRouter.delete("/:id", authentication, isAdmin ,serviceController.deleteService);