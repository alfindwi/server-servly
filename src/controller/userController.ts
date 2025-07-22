import { Request, Response } from "express";
import { updateUserSchema } from "../validation/userSchema";
import * as authService from "../service/userService";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const body = updateUserSchema.parse(req.body);

    const user = await authService.updateUser(userId, body, req.file);

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
