import { Request, Response } from "express";
import { CreateworkerSchema } from "../validation/workerSchema";
import * as workerService from "../service/workerService";
import { CreateWorkerProfileDTO } from "../dto/workerDto";

export const createWorker = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    
    const data : CreateWorkerProfileDTO = {
      userId: userId,
      bio: req.body.bio,
      experience: req.body.experience,
      city: req.body.city,
      province: req.body.province
    }

    const worker = await workerService.applyAsWorker(userId, data);

    res.status(201).json({ message: "Applied successfully, waiting for admin approval", worker });
  } catch (error) {
    console.log(error);
  }
};
