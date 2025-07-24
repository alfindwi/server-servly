import {
  CreateWorkerProfileDTO,
  UpdateWorkerProfileDTO,
} from "../dto/workerDto";
import { prisma } from "../libs/prisma";
import { v2 as cloudinary } from "cloudinary";
import uploader from "../libs/cloudinary";

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
        address: data.address,
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
      }
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