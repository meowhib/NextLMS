"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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
  } catch (error) {
    console.error(error);
  }
}
