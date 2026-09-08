import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    role: Role;
    isActive: boolean;
    createdAt: Date;
  };
  accessToken: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createToken(user: { id: string; role: Role; email: string }): string {
  return jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export async function register(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<AuthResult> {
  if (!data.email || !data.password) {
    throw new Error("email and password are required");
  }
  if (data.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error("Invalid email format");
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      phone: data.phone ?? null,
      role: Role.CUSTOMER,
      emailVerified: false,
    },
  });

  const token = createToken({ id: user.id, role: user.role, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    accessToken: token,
  };
}

export async function login(data: { email: string; password: string }): Promise<AuthResult> {
  if (!data.email || !data.password) {
    throw new Error("email and password are required");
  }

  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (!user || !user.isActive) {
    throw new Error("Invalid email or password");
  }
  if (!verifyPassword(data.password, user.passwordHash)) {
    throw new Error("Invalid email or password");
  }

  const token = createToken({ id: user.id, role: user.role, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    accessToken: token,
  };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; email?: string }) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new Error("User not found");

  if (data.email && data.email !== existing.email) {
    const taken = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (taken) throw new Error("This email is already in use");
    await prisma.user.update({ where: { id: userId }, data: { email: data.email.toLowerCase() } });
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName ?? existing.firstName,
      lastName: data.lastName ?? existing.lastName,
      phone: data.phone ?? existing.phone,
    },
  });
}

export async function changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
  if (data.newPassword.length < 8) throw new Error("New password must be at least 8 characters");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (!verifyPassword(data.currentPassword, user.passwordHash)) {
    throw new Error("Current password is incorrect");
  }

  const newHash = hashPassword(data.newPassword);
  return prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
}
