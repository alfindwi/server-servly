import { Router } from "express";
import * as workerController from "../controller/workerController";
import { authentication } from "../middlewares/auth";

export const workerRouter = Router();

workerRouter.post("/", authentication,workerController.createWorker);