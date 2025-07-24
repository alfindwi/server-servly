import { Request, Response } from "express";
import { CreateworkerSchema } from "../validation/workerSchema";
import * as workerService from "../service/workerService";
import { CreateWorkerProfileDTO, UpdateWorkerProfileDTO } from "../dto/workerDto";

export const createWorker = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;

    const data: CreateWorkerProfileDTO = {
      userId: userId,
      bio: req.body.bio,
      experience: req.body.experience,
      city: req.body.city,
      province: req.body.province,
    };

    const worker = await workerService.applyAsWorker(userId, data);

    res
      .status(201)
      .json({
        message: "Applied successfully, waiting for admin approval",
        worker,
      });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateWorker = async (req: Request, res: Response) => {
  try {
    const workerId = res.locals.user.id;
    
    const data : UpdateWorkerProfileDTO = req.body;

    const worker = await workerService.updateWorker(workerId, data, req.file);

    res.status(200).json({ message: "Worker updated successfully", worker });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
}


export const approveWorker = async (req: Request, res: Response) => {
  try {
    const workerId = req.params.id;

    const worker = await workerService.approveWorker(Number(workerId));

    res.status(200).json({ message: "Worker approved successfully", worker });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getWorkersApplyed = async (req: Request, res: Response) => {
  try {
    const workers = await workerService.getWorkersApplyed();

    res.status(200).json({ workers });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
