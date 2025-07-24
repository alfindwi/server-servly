import { Request, Response } from "express";
import * as servService from "../service/servService";
import { createServiceDTO } from "../dto/servDto";

export const getService = async (req: Request, res: Response) => {
  try {
    const services = await servService.getService();

    res.status(200).json({ services });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const data: createServiceDTO = req.body;

    const service = await servService.createService(data);

    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const service = await servService.updateService(id, data);

    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
}

export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const service = await servService.deleteService(id);

    res.status(200).json({ message: "Service deleted successfully", service });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const service = await servService.getServiceById(id);

    res.status(200).json({ service });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

