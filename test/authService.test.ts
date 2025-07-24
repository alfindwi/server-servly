import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../src/libs/prisma";
import * as authService from "../src/service/authService";

jest.mock("../src/libs/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("authService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loginService", () => {
    it("should login successfully and return token & user data", async () => {
      const fakeUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        role: "CUSTOMER",
        fullName: "Test User",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

      process.env.JWT_SECRET = "secret";

      const result = await authService.loginService({
        email: "test@example.com",
        password: "password123",
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        token: "fakeToken",
        user: {
          id: 1,
          email: "test@example.com",
          role: "CUSTOMER",
        },
      });
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.loginService({ email: "notfound@example.com", password: "pass" })
      ).rejects.toThrow("User not found");
    });

    it("should throw error if password invalid", async () => {
      const fakeUser = { id: 1, email: "test@example.com", password: "hashedPassword", role: "CUSTOMER", fullName: "Test User" };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.loginService({ email: "test@example.com", password: "wrongpass" })
      ).rejects.toThrow("Email or password is incorrect");
    });
  });

  describe("registerService", () => {
    it("should register new user successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 2,
        email: "new@example.com",
        role: "CUSTOMER",
        fullName: "New User",
      });

      const result = await authService.registerService({
        email: "new@example.com",
        password: "pass123",
        fullName: "New User",
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "new@example.com" } });
      expect(bcrypt.hash).toHaveBeenCalledWith("pass123", 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "new@example.com",
          password: "hashedPassword",
          fullName: "New User",
          role: "CUSTOMER",
        },
      });

      expect(result).toEqual({
        id: 2,
        email: "new@example.com",
        role: "CUSTOMER",
        fullName: "New User",
      });
    });

    it("should throw error if user already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: "exists@example.com" });

      await expect(
        authService.registerService({ email: "exists@example.com", password: "pass", fullName: "Exists" })
      ).rejects.toThrow("User already exists");
    });
  });
});
