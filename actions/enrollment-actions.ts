"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: string) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    await prisma.enrollment.create({
      data: {
        courseId,
        userId,
      },
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error(error);
  }
}
