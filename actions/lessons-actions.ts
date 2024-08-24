"use server";

import prisma from "@/lib/prisma";

export async function getLesson(lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
    },
    include: {
      chapter: true,
      attachments: true,
    },
  });

  return lesson;
}

export async function getLastVisitedLesson(courseId: string, userId: string) {
  const lastProgress = await prisma.userLessonProgress.findFirst({
    where: {
      userId: userId,
      lesson: {
        chapter: {
          courseId: courseId,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      lesson: {
        include: {
          chapter: true,
        },
      },
    },
  });

  return lastProgress?.lesson;
}
