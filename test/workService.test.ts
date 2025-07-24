import { userInfo } from "os";
import { prisma } from "../src/libs/prisma";
import * as workerService from "../src/service/workerService";

jest.mock("../src/libs/prisma", () => ({
  prisma: {
    workerProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("workService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("applyAsWorker", () => {
    it("should apply as worker successfully", async () => {
      (prisma.workerProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.workerProfile.create as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
        bio: "bio",
        experience: "experience",
        city: "city",
        province: "province",
        isVerified: false,
      });

      const data = {
        userId: 1,
        bio: "test bio",
        experience: 10,
        city: "test city",
        province: "test province",
      };

      const result = await workerService.applyAsWorker(1, data);

      expect(prisma.workerProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(prisma.workerProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          bio: "test bio",
          experience: 10,
          city: "test city",
          province: "test province",
        },
      });

      expect(result).toHaveProperty("id", 1);
    });

    it("should throw error if user already applied as worker", async () => {
      (prisma.workerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
      });

      const data = {
        userId: 1,
        bio: "test bio",
        experience: 10,
        city: "test city",
        province: "test province",
      };

      await expect(workerService.applyAsWorker(1, data)).rejects.toThrow(
        "You have already applied as a worker"
      );
    });
  });

  describe("getWorkersApplyed", () => {
    it("should return unverified workers", async () => {
      const fakeWorkers = [
        { id: 1, isVerified: false },
        { id: 2, isVerified: false },
      ];

      (prisma.workerProfile.findMany as jest.Mock).mockResolvedValue(
        fakeWorkers
      );

      const result = await workerService.getWorkersApplyed();

      expect(prisma.workerProfile.findMany).toHaveBeenCalledWith({
        where: { isVerified: false },
      });
      expect(result).toEqual(fakeWorkers);
    });

    it("should throw error if no workers found", async () => {
      (prisma.workerProfile.findMany as jest.Mock).mockResolvedValue(null);

      await expect(workerService.getWorkersApplyed()).rejects.toThrow(
        "No workers applied yet"
      );
    });
  });

  describe("approveWorker", () => {
    it("should approve worker successfully", async () => {
      (prisma.workerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
      });
      (prisma.workerProfile.update as jest.Mock).mockResolvedValue({
        id: 1,
        isVerified: true,
      });

      const result = await workerService.approveWorker(1);

      expect(prisma.workerProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.workerProfile.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isVerified: true },
      });
      expect(result).toHaveProperty("isVerified", true);
    });

    it("should throw error if worker not found", async () => {
      (prisma.workerProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(workerService.approveWorker(99)).rejects.toThrow(
        "Worker not found"
      );
    });
  });
});
