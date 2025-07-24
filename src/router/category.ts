import { Router } from "express";
import * as categoryController from "../controller/categoryCategory";
import { authentication } from "../middlewares/auth";
import { isAdmin } from "../middlewares/isAdmin";
export const categoryRouter = Router();

categoryRouter.get("/", authentication ,categoryController.getCategories);
categoryRouter.get("/:id", authentication ,categoryController.getCategoryById);
categoryRouter.post("/", authentication ,isAdmin ,categoryController.createCategory);
categoryRouter.put("/:id", authentication ,isAdmin ,categoryController.updateCategory);
categoryRouter.delete("/:id", authentication ,isAdmin ,categoryController.deleteCategory);