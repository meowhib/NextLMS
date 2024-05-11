import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { lessonId, userProgressSeconds, completed } = await request.json();

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

    return NextResponse.json(lessonProgress, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Progress update failed!" },
      { status: 500 }
    );
  }
}
