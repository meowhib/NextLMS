import * as fs from "fs";
import * as path from "path";
import prisma from "./prisma";
var slugify = require("slugify");

const rootDir = "public/courses";

function getNameAndIndex(input: string) {
  const regex = /^(\d+)\s*-\s*(.*)/;
  const match = input.match(regex);

  if (match) {
    const index = parseInt(match[1], 10);
    const name = match[2];
    return { name, index };
  }

  return { name: input, index: 0 };
}

function listDirectories(source: string) {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

function listFiles(source: string) {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);
}

async function createCourse(slug: string, title: string) {
  const course = await prisma.course.create({
    data: {
      slug,
      name: title,
      index: 0,
    },
  });

  return course;
}

async function createChapter(courseId: number, name: string, index: number) {
  const chapter = await prisma.chapter.create({
    data: {
      name,
      index,
      course: {
        connect: {
          id: courseId,
        },
      },
    },
  });

  return chapter;
}

async function createLesson(chapterId: number, name: string, index: number) {
  const lesson = await prisma.lesson.create({
    data: {
      name,
      chapter: {
        connect: {
          id: chapterId,
        },
      },
      index,
      progress: 0,
      completed: false,
      length: 0,
    },
  });

  return lesson;
}

export async function scanCourses() {
  const courseDirs = listDirectories(rootDir);
  console.log("Scanning courses...");

  for (const courseDir of courseDirs) {
    console.log(`Scanning course: ${courseDir}`);
    const coursePath = path.join(rootDir, courseDir);
    const chapters = listDirectories(coursePath);

    const course = await createCourse(
      slugify(courseDir, { lower: true, strict: true }),
      courseDir
    );

    for (const chapterDir of chapters) {
      const { name, index } = getNameAndIndex(chapterDir);
      console.log(`Scanning chapter: ${name}`);
      const chapterPath = path.join(coursePath, chapterDir);
      const lessons = listFiles(chapterPath);

      const chapter = await createChapter(course.id, name, index);

      for (const lessonFile of lessons) {
        const { name, index } = getNameAndIndex(lessonFile);

        if (name.endsWith(".mp4")) {
          console.log(`Scanning lesson: ${name}`);
          const lesson = await createLesson(chapter.id, name, index);
        }
      }
    }
  }
}
