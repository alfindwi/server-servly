import { LoginDTO, RegisterDTO } from "./../dto/authDto";
import { Request, Response } from "express";
import * as authService from "../service/authService";

export const login = async (req: Request, res: Response) => {
  try {
    const data = req.body as LoginDTO;

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
    const data = req.body as RegisterDTO;

    const user = await authService.registeerService(data);

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
