import * as categoryService from "../service/categoryService";
import { Request, Response } from "express";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories();

    res.status(200).json({ categories });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const category = await categoryService.getCategoryById(Number(id));

    res.status(200).json({ category });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const category = await categoryService.createCategory(
      data.name,
      data.description
    );

    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const category = await categoryService.updateCategory(
      Number(id),
      data.name,
      data.description
    );

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const category = await categoryService.deleteCategory(Number(id));

    res.status(200).json({ message: "Category deleted successfully", category });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
