import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { workerRouter } from "./worker";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/worker", workerRouter);

export default router;