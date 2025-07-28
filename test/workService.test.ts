import { prisma } from "../src/libs/prisma";
import * as workerService from "../src/service/workerService";

// Mock Prisma dengan semua model yang dibutuhkan
jest.mock("../src/libs/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    workerProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Create properly typed mocks
const mockPrismaUser = {
  findMany: jest.fn() as jest.MockedFunction<any>,
  findUnique: jest.fn() as jest.MockedFunction<any>,
  update: jest.fn() as jest.MockedFunction<any>,
};

const mockPrismaWorkerProfile = {
  findUnique: jest.fn() as jest.MockedFunction<any>,
  create: jest.fn() as jest.MockedFunction<any>,
  findMany: jest.fn() as jest.MockedFunction<any>,
  update: jest.fn() as jest.MockedFunction<any>,
};

// Assign mocks to prisma
(prisma as any).user = mockPrismaUser;
(prisma as any).workerProfile = mockPrismaWorkerProfile;

describe("workService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid noise in test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("applyAsWorker", () => {
    it("should apply as worker successfully", async () => {
      mockPrismaWorkerProfile.findUnique.mockResolvedValue(null);
      mockPrismaWorkerProfile.create.mockResolvedValue({
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

      expect(mockPrismaWorkerProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(mockPrismaWorkerProfile.create).toHaveBeenCalledWith({
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
      mockPrismaWorkerProfile.findUnique.mockResolvedValue({
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
        { 
          id: 1, 
          email: "worker1@test.com",
          workerProfile: { id: 1, isVerified: false }
        },
        { 
          id: 2, 
          email: "worker2@test.com",
          workerProfile: { id: 2, isVerified: false }
        },
      ];

      // Mock prisma.user.findMany karena service menggunakan user.findMany
      mockPrismaUser.findMany.mockResolvedValue(fakeWorkers);

      const result = await workerService.getWorkersApplyed();

      expect(mockPrismaUser.findMany).toHaveBeenCalledWith({
        where: {
          workerProfile: {
            isVerified: false,
          },
        },
        include: {
          workerProfile: true,
        },
      });
      expect(result).toEqual(fakeWorkers);
    });

    it("should throw error if no workers found", async () => {
      // Mock empty array instead of null
      mockPrismaUser.findMany.mockResolvedValue([]);

      await expect(workerService.getWorkersApplyed()).rejects.toThrow(
        "No workers applied yet"
      );
    });
  });

  describe("approveWorker", () => {
    it("should approve worker successfully", async () => {
      const mockWorkerProfile = {
        id: 1,
        userId: 1,
        isVerified: false,
      };

      const mockUpdatedUser = {
        id: 1,
        email: "test@test.com",
        workerProfile: {
          id: 1,
          isVerified: true,
        },
      };

      mockPrismaWorkerProfile.findUnique.mockResolvedValue(mockWorkerProfile);
      mockPrismaWorkerProfile.update.mockResolvedValue({
        ...mockWorkerProfile,
        isVerified: true,
      });
      mockPrismaUser.update.mockResolvedValue(mockUpdatedUser);

      const result = await workerService.approveWorker(1);

      expect(mockPrismaWorkerProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaWorkerProfile.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isVerified: true },
      });
      
      // Jika service juga update user table
      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 1 }, // userId from workerProfile
        data: expect.any(Object),
      });
    });

    it("should throw error if worker not found", async () => {
      mockPrismaWorkerProfile.findUnique.mockResolvedValue(null);

      await expect(workerService.approveWorker(99)).rejects.toThrow(
        "Worker not found"
      );
    });
  });
});