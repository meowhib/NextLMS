"use server";

import prisma from "@/lib/prisma";
import { scanCourses } from "@/lib/scanner";
import { redirect } from "next/navigation";

export async function startCoursesScan() {
  await scanCourses();

  redirect("/");
}

export async function getCourses() {
  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: {
          lessons: true,
        },
        orderBy: {
          index: "asc",
        },
      },
    },
  });

  return courses;
}

export async function getCourse(slug: string) {
  const course = await prisma.course.findFirst({
    where: {
      slug,
    },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
        orderBy: {
          index: "asc",
        },
      },
    },
  });

  return course;
}

export async function deleteCourse(slug: string) {
  const course = await prisma.course.delete({
    where: {
      slug,
    },
  });

  return course;
}
