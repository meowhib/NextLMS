import * as fs from "fs";
import * as path from "path";
import prisma from "./prisma";
var slugify = require("slugify");

const rootDir = "public/courses";

function getNameAndIndex(input: string) {
  const regex = /^(\d+)[\s\-\.\_]*(.+?)(?=\.\w+$|$)/;
  const match = input.match(regex);

  if (match) {
    const index = parseInt(match[1], 10);
    const name = match[2].trim();
    return { name, index };
  }

  return { name: input, index: 0 };
}

async function createCourse(slug: string, title: string) {
  return prisma.course.create({
    data: {
      slug,
      title,
    },
  });
}

async function createChapter(courseId: string, title: string, index: number) {
  return prisma.chapter.create({
    data: {
      courseId,
      title,
      index,
    },
  });
}

async function createLesson(
  chapterId: string,
  title: string,
  index: number,
  videoPath: string
) {
  return prisma.lesson.create({
    data: {
      chapterId,
      title,
      index,
      videoPath,
    },
  });
}

async function linkSubtitleToLesson(lessonId: string, subtitlePath: string) {
  return prisma.subtitle.create({
    data: {
      lessonId,
      path: subtitlePath,
    },
  });
}

async function linkMaterialToLesson(lessonId: string, materialPath: string) {
  return prisma.material.create({
    data: {
      lessonId,
      path: materialPath,
    },
  });
}

const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".flv"];
const subtitleExtensions = [".srt", ".vtt"];
const materialExtensions = [
  ".html",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
];

export async function scanCourses() {
  const courseDirs = listDirectories(rootDir);
  console.log("🔍 Scanning courses...");

  for (const courseDir of courseDirs) {
    console.log(`🗃️ Scanning course: ${courseDir}`);
    const coursePath = path.join(rootDir, courseDir);
    const chapters = listDirectories(coursePath);
    const course = await createCourse(
      slugify(courseDir, { lower: true, strict: true }),
      courseDir
    );

    let chapterCount = 0;
    let lessonCount = 0;

    for (const chapterDir of chapters) {
      const { name, index } = getNameAndIndex(chapterDir);
      console.log(`📗 Scanning chapter: ${name}`);
      const chapterPath = path.join(coursePath, chapterDir);
      const files = listFiles(chapterPath);
      const chapter = await createChapter(course.id, name, index);
      chapterCount++;

      for (const file of files) {
        const { name, index } = getNameAndIndex(file);
        const extension = path.extname(file).toLowerCase();
        if (videoExtensions.includes(extension)) {
          console.log(`📽️ Scanning lesson: ${name}`);
          const lesson = await createLesson(
            chapter.id,
            name,
            index,
            path.join(courseDir, chapterDir, file)
          );
          lessonCount++;

          const subtitleFiles = files.filter(
            (f) =>
              path.basename(f, path.extname(f)) ===
                path.basename(file, path.extname(file)) &&
              subtitleExtensions.includes(path.extname(f).toLowerCase())
          );
          const materialFiles = files.filter(
            (f) =>
              path.basename(f, path.extname(f)) ===
                path.basename(file, path.extname(file)) &&
              materialExtensions.includes(path.extname(f).toLowerCase())
          );

          for (const subtitleFile of subtitleFiles) {
            await linkSubtitleToLesson(lesson.id, subtitleFile);
          }
          for (const materialFile of materialFiles) {
            await linkMaterialToLesson(lesson.id, materialFile);
          }
        }
      }
    }

    console.log(
      `✅ Course "${courseDir}" scanned successfully with ${chapterCount} chapters and ${lessonCount} lessons.`
    );
  }
}

function listDirectories(dir: string) {
  return fs
    .readdirSync(dir)
    .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory());
}

function listFiles(dir: string) {
  return fs
    .readdirSync(dir)
    .filter((entry) => fs.statSync(path.join(dir, entry)).isFile());
}
