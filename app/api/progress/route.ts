import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const { courseSlug, lessonId, userProgressSeconds, completed } =
      await request.json();

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Progress update failed! Unauthorized." },
        { status: 401 }
      );
    }

    const userLessonProgress = await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session?.user?.id,
          lessonId: lessonId,
        },
      },
      update: {
        progressSeconds: userProgressSeconds,
        completed: completed,
      },
      create: {
        userId: session?.user?.id,
        lessonId: lessonId,
        progressSeconds: userProgressSeconds,
        completed: false,
      },
    });

    // console.log("📚 User lesson progress:", userLessonProgress);

    // console.log(
    //   "📚 Progress update:",
    //   courseSlug,
    //   lessonId,
    //   userProgressSeconds,
    //   completed
    // );

    return NextResponse.json({ message: "Progress updated!" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Progress update failed! Internal error." },
      { status: 500 }
    );
  }
}
