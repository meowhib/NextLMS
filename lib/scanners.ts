import fs from "fs";
import path from "path";
import prisma from "./prisma";

// List all directories in a given path
export function listDirectories(dir: string) {
  return fs
    .readdirSync(dir)
    .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory());
}

// List all files in a given path
export function listFiles(dir: string) {
  return fs
    .readdirSync(dir)
    .filter((entry) => fs.statSync(path.join(dir, entry)).isFile());
}

// Gets a name of a lesson and it returns the name and index
export function getNameAndIndex(input: string) {
  const regex = /^(\d+)[\s\-\.\_]*(.+?)(?=\.\w+$|$)/;
  const match = input.match(regex);

  if (match) {
    const index = parseInt(match[1], 10);
    const name = match[2].trim();
    return { name, index };
  }

  return { name: input, index: 0 };
}

// Create a course in the database
export async function createCourse(slug: string, title: string) {
  return prisma.course.upsert({
    where: { slug },
    update: { title },
    create: { slug, title },
  });
}

// Create a chapter in the database
export async function createChapter(
  courseId: string,
  title: string,
  index: number
) {
  return prisma.chapter.create({
    data: {
      courseId,
      title,
      index,
    },
  });
}

// Create a lesson in the database
export async function createLesson(
  chapterId: string,
  title: string,
  index: number,
  videoPath: string,
  isAttachment: boolean
) {
  return prisma.lesson.create({
    data: {
      chapterId,
      title,
      index,
      videoPath,
      isAttachment,
    },
  });
}

// Link a subtitle to a lesson in the database
export async function linkSubtitleToLesson(
  lessonId: string,
  subtitlePath: string
) {
  console.log("🔗 Linking subtitle to lesson:", lessonId, subtitlePath);
  return prisma.subtitle.create({
    data: {
      lessonId,
      path: subtitlePath,
    },
  });
}

// Link a material to a lesson in the database
export async function linkMaterialToLesson(
  lessonId: string,
  materialPath: string
) {
  console.log("🔗 Linking material to lesson:", lessonId, materialPath);
  return prisma.material.create({
    data: {
      lessonId,
      path: materialPath,
    },
  });
}

async function createOrUpdateCourse(slug: string, title: string) {
  let course = await prisma.course.findUnique({
    where: { slug },
  });

  if (course) {
    course = await prisma.course.update({
      where: { slug },
      data: { title },
    });
    console.log(`📚 Updated existing course: "${course.title}"`);
  } else {
    course = await prisma.course.create({
      data: {
        slug,
        title,
      },
    });
    console.log(`📚 Created new course: "${course.title}"`);
  }

  return course;
}
