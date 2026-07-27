import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import {
  AuthRequest,
  JwtPayload,
  RegisterBody,
  LoginBody,
  RefreshBody,
} from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateTokens = (userId: number): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { userId } satisfies JwtPayload,
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY ?? "15m") as jwt.SignOptions["expiresIn"] }
  );

  const refreshToken = jwt.sign(
    { userId } satisfies JwtPayload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY ?? "7d") as jwt.SignOptions["expiresIn"] }
  );

  return { accessToken, refreshToken };
};

const refreshTokenExpiry = (): Date =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

// ─── Controllers ─────────────────────────────────────────────────────────────

export const register = async (
  req: Request<object, object, RegisterBody>,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
  });

  res.status(201).json({ user, accessToken, refreshToken });
};

export const login = async (
  req: Request<object, object, LoginBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
  });

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, accessToken, refreshToken });
};

export const refreshTokens = async (
  req: Request<object, object, RefreshBody>,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token required" });
    return;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: " or expired refresh token" });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;

    // Rotate: delete old, issue new pair
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload.userId);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: refreshTokenExpiry(),
      },
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const logout = async (
  req: Request<object, object, RefreshBody>,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
  }

  res.json({ message: "Logged out successfully" });
};

export const getMe = (req: Request, res: Response): void => {
  const { password: _, ...safeUser } = (req as AuthRequest).user;
  res.json(safeUser);
};
