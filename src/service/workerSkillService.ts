import { prisma } from "../libs/prisma";

export const getWorkerSkills = async (workerId: number) => {
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: {
        id: workerId,
      },
    });

    if (!worker || !workerId) {
      throw new Error("Worker not found");
    }

    const workerSkills = await prisma.workerSkill.findMany({
      where: {
        workerId: workerId,
      },
      include: {
        service: true,
      },
    });

    return workerSkills;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addWorkerSkill = async (workerId: number, serviceId: string) => {
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: workerId },
    });

    if (!worker || !workerId) {
      throw new Error("Worker not found");
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service || !serviceId) {
      throw new Error("Service not found");
    }

    const existedSkill = await prisma.workerSkill.findFirst({
      where: {
        workerId: workerId,
        serviceId: serviceId,
      },
    });

    if (existedSkill) {
      throw new Error("Worker already has this skill");
    }

    const newSkill = await prisma.workerSkill.create({
      data: {
        workerId: workerId,
        serviceId: serviceId,
      },
    });

    return newSkill;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateWorkerSkill = async (
  workerId: number,
  workerSkill: number,
  serviceId: string
) => {
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: {
        id: workerId,
      },
    });

    if (!worker || !workerId) {
      throw new Error("Worker not found");
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service || !serviceId) {
      throw new Error("Service not found");
    }

    const existedSkill = await prisma.workerSkill.findFirst({
      where: {
        workerId: workerId,
        serviceId: serviceId,
      },
    });

    if (!existedSkill) {
      throw new Error("Worker does not have this skill");
    }

    const newSkill = await prisma.workerSkill.update({
      where: {
        id: workerSkill,
      },
      data: {
        serviceId: serviceId,
      },
    });

    return newSkill;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteWorkerSkill = async (
  workerId: number,
  workerSkill: number
) => {
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: {
        id: workerId,
      },
    });

    if (!worker || !workerId) {
      throw new Error("Worker not found");
    }

    const existedSkill = await prisma.workerSkill.findFirst({
      where: {
        workerId: workerId,
        id: workerSkill,
      },
    });

    if (!existedSkill) {
      throw new Error("Worker does not have this skill");
    }

    const newSkill = await prisma.workerSkill.delete({
      where: {
        id: workerSkill,
      },
    });

    return newSkill;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
