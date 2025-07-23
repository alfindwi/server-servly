import { NextFunction, Request, Response } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (res.locals.user.role !== "ADMIN") {
      return res.status(401).json({ message: "You are not an admin" });
    }

    next();
  } catch (error: any) {
    console.log(error);
    res
      .status(401)
      .json({ message: `Error in authentication: ${error.message}` });
  }
};
