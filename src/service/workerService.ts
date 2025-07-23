import { CreateWorkerProfileDTO } from "../dto/workerDto";
import { prisma } from "../libs/prisma";

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
