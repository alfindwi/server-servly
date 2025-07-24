import { Router } from "express";
import * as workerController from "../controller/workerController";
import { authentication } from "../middlewares/auth";
import { isAdmin } from "../middlewares/isAdmin";
import upload from "../middlewares/uploadFile";

export const workerRouter = Router();

workerRouter.post("/", authentication,workerController.createWorker);
workerRouter.get("/applyed", authentication, isAdmin,workerController.getWorkersApplyed);
workerRouter.put("/approve/:id", authentication, isAdmin, workerController.approveWorker);
workerRouter.put("/profile", authentication, upload.single("avatar"),workerController.updateWorker);