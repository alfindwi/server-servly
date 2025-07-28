import { createServiceDTO, updateServiceDTO } from "../dto/servDto";
import { getOrSetCache } from "../libs/cache";
import { prisma } from "../libs/prisma";

export const getService = async () => {
  try {
    const cache = "services:all";
    const ttl = 60 * 10;

    return await getOrSetCache(cache, ttl, async () => {
      const services = await prisma.service.findMany({
        select: {
            name: true,
            description: true,
            basePrice: true,
            duration: true,
            category: {
                select: {
                    name: true,
                },
            },
        }
    });

    return services;
    })
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createService = async (data: createServiceDTO) => {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const service = await prisma.service.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        duration: data.duration,
      },
    });

    return service;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateService = async (id: string, data: updateServiceDTO) => {
  try {
    const findService = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!findService) {
      throw new Error("Service not found");
    }

    const service = await prisma.service.update({
      where: {
        id,
      },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        duration: data.duration,
      },
    });

    return service;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteService = async (id: string) => {
  try {
    const service = await prisma.service.delete({
      where: {
        id,
      },
    });

    return service;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getServiceById = async (id: string) => {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    return service;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
