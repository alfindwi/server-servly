import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { workerRouter } from "./worker";
import { serviceRouter } from "./service";
import { categoryRouter } from "./category";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/worker", workerRouter);
router.use("/service", serviceRouter);
router.use("/category", categoryRouter);

export default router;
