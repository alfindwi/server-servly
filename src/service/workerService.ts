import { v2 as cloudinary } from "cloudinary";
import {
  CreateWorkerProfileDTO,
  UpdateWorkerProfileDTO,
} from "../dto/workerDto";
import { getOrSetCache } from "../libs/cache";
import uploader from "../libs/cloudinary";
import { prisma } from "../libs/prisma";

export const getAllWorker = async () => {
  try {
    const cacheKey = "workers:all";
    const ttl = 60 * 10;

    return await getOrSetCache(cacheKey, ttl, async () => {
      const workers = await prisma.user.findMany({
        where: {
          role: "WORKER",
        },
        include: {
          workerProfile: {
            include: {
              user: {
                select: {
                  fullName: true,
                  phone: true,
                  email: true,
                  avatar: true,
                },
              },
              Skills: {  
                include: {
                  service: {
                    select: {
                      name: true,
                      description: true,
                      duration: true,
                      basePrice: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!workers || workers.length === 0) {
        throw new Error("No workers found");
      }

      return workers;
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};



export const getWorkerByService = async (serviceId: string) => {
  try {
    const worker = await prisma.workerProfile.findMany({
      where: {
        Skills: {
          some: {
            service: {
              id: serviceId,
            },
          },
        },
        isVerified: true,
      },
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        Skills: {
          include: {
            service: {
              select: {
                name: true,
                description: true,
                duration: true,
                basePrice: true,
              },
            },
          },
        },
      },
    });

    if (!worker) {
      throw new Error("No workers found");
    }

    return worker;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const filterWorkerByCity = async (city: string) => {
  try {
    const worker = await prisma.workerProfile.findMany({
      where: {
        city: city,
        isVerified: true,
      },
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!worker) {
      throw new Error("No workers found");
    }

    return worker;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const applyAsWorker = async (
  userId: number,
  data: CreateWorkerProfileDTO
) => {
  try {
    const existedWorker = await prisma.workerProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (existedWorker) {
      throw new Error("You have already applied as a worker");
    }

    const createWorker = await prisma.workerProfile.create({
      data: {
        userId: userId,
        bio: data.bio,
        experience: data.experience,
        city: data.city,
        province: data.province,
      },
    });

    return createWorker;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateWorker = async (
  workerId: number,
  data: UpdateWorkerProfileDTO,
  file?: Express.Multer.File
) => {
  try {
    const existedWorker = await prisma.user.findUnique({
      where: {
        id: workerId,
      },
    });

    if (!existedWorker) {
      throw new Error("Worker not found");
    }

    let avatarData = {};

    if (file) {
      if (existedWorker.avatarPublicId) {
        await cloudinary.uploader.destroy(existedWorker.avatarPublicId);
      }

      const uploadResult = await uploader(file);

      avatarData = {
        avatar: uploadResult.secure_url,
        avatarPublicId: uploadResult.public_id,
      };
    }

    const updateWorker = await prisma.user.update({
      where: {
        id: workerId,
      },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        ...avatarData,
        workerProfile: {
          update: {
            bio: data.bio,
            experience: data.experience,
            city: data.city,
            province: data.province,
          },
        },
      },
      include: {
        workerProfile: {
          select: {
            bio: true,
            experience: true,
            city: true,
            province: true,
          },
        },
      },
    });

    return updateWorker;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWorkersApplyed = async () => {
  try {
    const workers = await prisma.user.findMany({
      where: {
        workerProfile: {
          isVerified: false,
        },
      },
      include: {
        workerProfile: true,
      },
    });

    if (!workers || workers.length === 0) {
      throw new Error("No workers applied yet");
    }

    return workers;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const approveWorker = async (workerId: number) => {
  try {
    const findWorker = await prisma.workerProfile.findUnique({
      where: {
        id: workerId,
      },
    });
    if (!findWorker) {
      throw new Error("Worker not found");
    }

    await prisma.workerProfile.update({
      where: {
        id: workerId,
      },
      data: {
        isVerified: true,
      },
    });

    const user = await prisma.user.update({
      where: {
        id: findWorker.userId,
      },
      data: {
        role: "WORKER",
      },
    });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
