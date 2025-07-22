import { Request, Response } from "express";
import * as authService from "../service/authService";
import { loginDTO, registerDTO } from "../dto/authDto";
import { loginSchema, registerSchema } from "../validation/authSchema";
import { ZodError } from "zod";

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const token = await authService.loginService(data);

    res.status(200).json({ token });
  } catch (error) {
    console.log(error);

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await authService.registeerService(data);

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);

    if (error instanceof ZodError) {
      const messages = error.issues.map((err) => err.message);
      return res.status(400).json({ error: messages });
    }

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
