"use server";

import prisma from "@/lib/prisma";
import { scanLocalCourses } from "@/lib/localCoursesScanner";
import { scanBucketCourses } from "@/lib/bucketCoursesScanner";
import { redirect } from "next/navigation";

export async function startLocalCoursesScan() {
  await scanLocalCourses();

  redirect("/");
}

export async function startBucketCoursesScan() {
  await scanBucketCourses();

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
      enrollments: true,
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
      enrollments: true,
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

export async function countCourses() {
  const count = await prisma.course.count();

  return count;
}

export async function countLessons() {
  const count = await prisma.lesson.count();

  return count;
}

export async function countCompletedLessons() {
  const count = await prisma.userLessonProgress.count({
    where: {
      completed: true,
    },
  });

  return count;
}

export async function getEnrolledCourses(userId: string) {
  const courses = await prisma.course.findMany({
    where: {
      enrollments: {
        some: {
          userId,
        },
      },
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
      enrollments: true,
    },
  });

  return courses;
}
