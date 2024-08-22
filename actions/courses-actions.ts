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
    },
  });

  return courses;
}

export async function getUserCoursesWithCompletedLessons(userId: string) {
  const courses = await prisma.course.findMany({
    where: {
      enrollments: {
        some: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      chapters: {
        select: {
          lessons: {
            select: {
              id: true,
              title: true,
              progress: {
                where: {
                  userId: userId,
                  completed: true,
                },
                select: {
                  completed: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const result = courses.map((course) => {
    const completedLessons = course.chapters.reduce((acc, chapter) => {
      const completedInChapter = chapter.lessons.filter(
        (lesson) => lesson.progress.length > 0
      ).length;
      return acc + completedInChapter;
    }, 0);

    return {
      courseId: course.id,
      courseTitle: course.title,
      completedLessons: completedLessons,
    };
  });

  return result;
}

export async function getCourse(slug: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: {
      slug,
    },
    include: {
      chapters: {
        include: {
          lessons: {
            include: {
              progress: {
                where: {
                  userId: userId,
                },
                orderBy: {
                  updatedAt: "desc",
                },
                take: 1,
              },
              attachments: true,
            },
          },
        },
        orderBy: {
          index: "asc",
        },
      },
      enrollments: true,
    },
  });

  if (!course) return null;

  // Find the last studied lesson
  let lastStudiedLesson = null;
  for (const chapter of course.chapters) {
    for (const lesson of chapter.lessons) {
      if (lesson.progress.length > 0) {
        if (
          !lastStudiedLesson ||
          lesson.progress[0].updatedAt > lastStudiedLesson.progress[0].updatedAt
        ) {
          lastStudiedLesson = lesson;
        }
      }
    }
  }

  return {
    ...course,
    lastStudiedLessonId: lastStudiedLesson ? lastStudiedLesson.id : null,
  };
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
          lessons: {
            include: {
              progress: {
                where: {
                  userId: userId,
                },
                orderBy: {
                  updatedAt: "desc",
                },
                take: 1,
              },
              attachments: true,
            },
          },
        },
        orderBy: {
          index: "asc",
        },
      },
      enrollments: true,
    },
  });

  const result = courses.map((course) => {
    let lastStudiedLessonId = null;
    let lastUpdatedAt = new Date(0); // Initialize with the earliest possible date

    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (
          lesson.progress.length > 0 &&
          lesson.progress[0].updatedAt > lastUpdatedAt
        ) {
          lastStudiedLessonId = lesson.id;
          lastUpdatedAt = lesson.progress[0].updatedAt;
        }
      }
    }

    return {
      ...course,
      lastStudiedLessonId,
    };
  });

  return result;
}
