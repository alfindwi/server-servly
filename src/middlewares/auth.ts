import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if(!process.env.JWT_SECRET){
      throw new Error("JWT_SECRET environment variable is not set");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id : number
    }

    if(!decoded){
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.locals.user = decoded;

    next();
  } catch (error : any) {
    console.log(error);
    res.status(401).json({ message: `Error in authentication: ${error.message}` });
  }
};
