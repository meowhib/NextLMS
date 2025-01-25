"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginWithGithub() {
  await signIn("github");
}

export async function loginWithCredentials(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (!result?.error) {
      return { success: true };
    }

    return { 
      success: false, 
      error: "Invalid email or password" 
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong" };
      }
    }
    throw error;
  }
} 