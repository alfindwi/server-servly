import * as reviewService from "../src/service/reviewService";
import { prisma } from "../src/libs/prisma";

jest.mock("../src/libs/prisma", () => ({
  prisma: {
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
    },
  },
}));

describe("reviewService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getReviewById", () => {
    it("should return reviews with customer", async () => {
      const fakeReviews = [{ id: 1, customer: { id: 2, name: "John" } }];
      (prisma.review.findMany as jest.Mock).mockResolvedValue(fakeReviews);

      const result = await reviewService.getReviewById(1);

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { workerId: 1 },
        include: { customer: true },
      });
      expect(result).toEqual(fakeReviews);
    });
  });

  describe("getReview", () => {
    it("should return all reviews with customer", async () => {
      const fakeReviews = [{ id: 1, customer: { id: 2 } }];
      (prisma.review.findMany as jest.Mock).mockResolvedValue(fakeReviews);

      const result = await reviewService.getReview();

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        include: { customer: true },
      });
      expect(result).toEqual(fakeReviews);
    });
  });

  describe("createReview", () => {
    it("should create review if booking completed", async () => {
      const booking = { id: 1, customerId: 10, status: "COMPLETED" };
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(booking);

      const fakeReview = { id: 1, rating: 5, comment: "Good" };
      (prisma.review.create as jest.Mock).mockResolvedValue(fakeReview);

      const data = { customerId: 10, workerId: 20, rating: 5, comment: "Good" };
      const result = await reviewService.createReview(10, 1, data);

      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { customer: true },
      });
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          customerId: 10,
          workerId: 20,
          rating: 5,
          comment: "Good",
        },
      });
      expect(result).toEqual(fakeReview);
    });

    it("should throw if booking not found or not owned", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        reviewService.createReview(10, 1, {
          customerId: 10,
          workerId: 20,
          rating: 5,
          comment: "Good",
        })
      ).rejects.toThrow("Booking not found");
    });

    it("should throw if booking status not COMPLETED", async () => {
      const booking = { id: 1, customerId: 10, status: "PENDING" };
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(booking);

      await expect(
        reviewService.createReview(10, 1, {
          customerId: 10,
          workerId: 20,
          rating: 5,
          comment: "Good",
        })
      ).rejects.toThrow("Booking not completed");
    });
  });

  describe("updateReview", () => {
    it("should update review if owned by user", async () => {
      const existedReview = { id: 1, customerId: 10 };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(existedReview);

      const updatedReview = { id: 1, rating: 4, comment: "Updated" };
      (prisma.review.update as jest.Mock).mockResolvedValue(updatedReview);

      const result = await reviewService.updateReview(1, 10, {
        rating: 4,
        comment: "Updated",
      });

      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { rating: 4, comment: "Updated" },
      });
      expect(result).toEqual(updatedReview);
    });

    it("should throw if review not owned by user", async () => {
      const existedReview = { id: 1, customerId: 99 };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(existedReview);

      await expect(
        reviewService.updateReview(1, 10, { rating: 4, comment: "Updated" })
      ).rejects.toThrow("You don't have permission to update this review");
    });
  });

  describe("deleteReview", () => {
    it("should delete review if owned by user", async () => {
      const existedReview = { id: 1, customerId: 10 };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(existedReview);

      const deletedReview = { id: 1 };
      (prisma.review.delete as jest.Mock).mockResolvedValue(deletedReview);

      const result = await reviewService.deleteReview(1, 10);

      expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(deletedReview);
    });

    it("should throw if not owned by user", async () => {
      const existedReview = { id: 1, customerId: 99 };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(existedReview);

      await expect(reviewService.deleteReview(1, 10)).rejects.toThrow(
        "You can only delete your own review"
      );
    });
  });
});
