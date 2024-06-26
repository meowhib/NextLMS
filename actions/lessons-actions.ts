"use server";

import prisma from "@/lib/prisma";

export async function getLesson(lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
    },
    include: {
      chapter: true,
    },
  });

  return lesson;
}
