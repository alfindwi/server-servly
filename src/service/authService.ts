import { prisma } from "../libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginDTO, registerDTO } from "../dto/authDto";

export const loginService = async (data: loginDTO) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      user.password ?? ""
    );

    if (!isValidPassword) {
      throw new Error("Email or password is incorrect");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.log(`Login error: ${error}`);
    throw error; 
  }
};

export const registeerService = async (data: registerDTO) => {
  try {
    const existedUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existedUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: "CUSTOMER",
      },
    });

    return user;
  } catch (error) {
    console.log(`Register error: ${error}`);
    throw error; 
  }
};

