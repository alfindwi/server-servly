import { getOrSetCache } from "../libs/cache";
import { prisma } from "../libs/prisma";

export const getCategories = async () => {
  try {
    const cache = "categories:all";
    const ttl = 60 * 10;

    return await getOrSetCache(cache, ttl, async () => {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      return categories;
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCategoryById = async (id: number) => {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    return category;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createCategory = async (name: string, description: string) => {
  try {
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return category;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  name: string,
  description: string
) => {
  try {
    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        description,
      },
    });

    return category;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteCategory = async (id: number) => {
  try {
    const category = await prisma.category.delete({
      where: {
        id,
      },
    });

    return category;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
