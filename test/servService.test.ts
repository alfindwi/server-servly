import { prisma } from "../src/libs/prisma";
import { getOrSetCache } from "../src/libs/cache";
import * as serviceService from "../src/service/servService";

// Mock prisma dan getOrSetCache
jest.mock("../src/libs/prisma", () => ({
  prisma: {
    service: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("../src/libs/cache", () => ({
  getOrSetCache: jest.fn(),
}));

describe("serviceService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getService", () => {
    it("should return services from cache", async () => {
      const fakeServices = [{ name: "AC Repair" }];
      (getOrSetCache as jest.Mock).mockResolvedValue(fakeServices);

      const result = await serviceService.getService();

      expect(getOrSetCache).toHaveBeenCalledWith(
        "services:all",
        600, // ttl
        expect.any(Function)
      );
      expect(result).toEqual(fakeServices);
    });
  });

  describe("createService", () => {
    it("should create service successfully", async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      const createdService = { id: "1", name: "AC Service" };
      (prisma.service.create as jest.Mock).mockResolvedValue(createdService);

      const result = await serviceService.createService({
        categoryId: 1,
        name: "AC Service",
        description: "Desc",
        basePrice: 100,
        duration: 60,
      });

      expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.service.create).toHaveBeenCalledWith({
        data: {
          categoryId: 1,
          name: "AC Service",
          description: "Desc",
          basePrice: 100,
          duration: 60,
        },
      });
      expect(result).toEqual(createdService);
    });

    it("should throw error if category not found", async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        serviceService.createService({
          categoryId: 99,
          name: "X",
          description: "Y",
          basePrice: 50,
          duration: 30,
        })
      ).rejects.toThrow("Category not found");
    });
  });

  describe("updateService", () => {
    it("should update service successfully", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue({ id: "1" });
      const updatedService = { id: "1", name: "Updated" };
      (prisma.service.update as jest.Mock).mockResolvedValue(updatedService);

      const result = await serviceService.updateService("1", {
        categoryId: 2,
        name: "Updated",
        description: "New desc",
        basePrice: 200,
        duration: 90,
      });

      expect(prisma.service.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          categoryId: 2,
          name: "Updated",
          description: "New desc",
          basePrice: 200,
          duration: 90,
        },
      });
      expect(result).toEqual(updatedService);
    });

    it("should throw error if service not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        serviceService.updateService("1", {
          categoryId: 2,
          name: "Updated",
          description: "New desc",
          basePrice: 200,
          duration: 90,
        })
      ).rejects.toThrow("Service not found");
    });
  });

  describe("deleteService", () => {
    it("should delete service successfully", async () => {
      const deleted = { id: "1" };
      (prisma.service.delete as jest.Mock).mockResolvedValue(deleted);

      const result = await serviceService.deleteService("1");

      expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: "1" } });
      expect(result).toEqual(deleted);
    });
  });

  describe("getServiceById", () => {
    it("should get service by id", async () => {
      const found = { id: "1", name: "Service" };
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(found);

      const result = await serviceService.getServiceById("1");

      expect(prisma.service.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
      expect(result).toEqual(found);
    });
  });
});
