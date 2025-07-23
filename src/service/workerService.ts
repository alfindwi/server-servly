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

export const getWorkersApplyed = async () => {
  try {
    const workers = await prisma.workerProfile.findMany({
      where: {
        isVerified: false,
      },
    });

    if (!workers) {
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

    const approvedWorker = await prisma.workerProfile.update({
      where: {
        id: workerId,
      },
      data: {
        isVerified: true,
      },
    });

    return approvedWorker;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
