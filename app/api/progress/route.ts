import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { courseSlug, lessonId, userProgressSeconds, completed } =
    await request.json();

  console.log(
    "📚 Progress update:",
    courseSlug,
    lessonId,
    userProgressSeconds,
    completed
  );

  try {
    const lessonProgress = await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        userProgressSeconds,
        completed,
      },
    });

    const latestLesson = await prisma.course.update({
      where: {
        slug: courseSlug,
      },
      data: {
        latestLessonId: lessonId,
      },
    });

    return NextResponse.json(lessonProgress, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Progress update failed!" },
      { status: 500 }
    );
  }
}
