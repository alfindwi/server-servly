import { Request, Response } from "express";
import * as reviewService from "../service/reviewService";
import { updateReviewDTO } from "../dto/reviewDto";
import { createReviewSchema, updateReviewSchema } from "../validation/reviewSchema";

export const createReview = async (req: Request, res: Response) => {
  try {
    const data = createReviewSchema.parse(req.body);
    const id = res.locals.user.id;
    const booking = +req.params.id;

    const review = await reviewService.createReview(id, booking, data);

    res.status(201).json(review);
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getReview();

    res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const id = +req.params.id;

    const review = await reviewService.getReviewById(id);

    res.status(200).json(review);
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const id = +req.params.id;
    const userId = res.locals.user.id;
    const data = updateReviewSchema.parse(req.body);

    if (!("rating" in data && "comment" in data)) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const review = await reviewService.updateReview(id, userId, data);

    res.status(200).json(review);
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = +req.params.id;
    const userId = res.locals.user.id;

    const review = await reviewService.deleteReview(id, userId);

    res.status(200).json(review);
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
