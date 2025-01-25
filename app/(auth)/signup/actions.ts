"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  confirmEmail: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Emails don't match",
  path: ["confirmEmail"],
});

export async function registerUser(email: string, confirmEmail: string, password: string) {
  try {
    // Validate input
    const result = signupSchema.safeParse({ email, confirmEmail, password });
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Something went wrong during registration" };
  }
} 