import { Router } from "express";
import * as userController from "../controller/userController";
import { authentication } from "../middlewares/auth";
import upload from "../middlewares/uploadFile";

export const userRouter = Router();

userRouter.put("/", authentication, upload.single("avatar"), userController.updateUser);
