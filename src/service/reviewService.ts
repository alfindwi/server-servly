import { createReviewDTO, updateReviewDTO } from "../dto/reviewDto";
import { prisma } from "../libs/prisma";

export const getReviewById = async (workerId: number) => {
  try {
    const review = await prisma.review.findMany({
      where: {
        workerId,
      },
      select: {
        rating: true,
      },
    });

    if (review.length === 0) {
      return { avarage: 0, totalReviews: 0 };
    }

    const sum = review.reduce((acc, curr) => acc + curr.rating, 0);
    const total = review.length;
    const avarage = sum / total;

    return { avarage: parseFloat(avarage.toFixed(1)), totalReviews: total };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getReview = async () => {
  try {
    const review = await prisma.review.findMany({
      include: {
        customer: true,
      },
    });

    return review;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createReview = async (
  userId: number,
  bookId: number,
  data: createReviewDTO
) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookId },
      include: { customer: true },
    });

    if (!booking || booking.customerId !== userId) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "COMPLETED") {
      throw new Error("Booking not completed");
    }

    const review = await prisma.review.create({
      data: {
        customerId: data.customerId,
        workerId: data.workerId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    return review;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateReview = async (
  reviewId: number,
  userId: number,
  data: updateReviewDTO
) => {
  try {
    const existedReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (existedReview?.customerId !== userId) {
      throw new Error("You don't have permission to update this review");
    }

    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
    });

    return review;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteReview = async (id: number, userId: number) => {
  try {
    const existedReview = await prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (existedReview?.customerId !== userId) {
      throw new Error("You can only delete your own review");
    }

    const review = await prisma.review.delete({
      where: {
        id,
      },
    });

    return review;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
