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
  console.log("🔗 Linking subtitle to lesson:", lessonId, subtitlePath);
  return prisma.subtitle.create({
    data: {
      lessonId,
      path: subtitlePath,
    },
  });
}

async function linkMaterialToLesson(lessonId: string, materialPath: string) {
  console.log("🔗 Linking material to lesson:", lessonId, materialPath);
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
  ".pdf",
  ".html",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".zip",
  ".rar",
  ".7z",
  ".url",
];

export async function scanCourses() {
  const courseDirs = listDirectories(rootDir);
  console.log("🔍 Scanning courses...");

  if (courseDirs.length === 0) {
    console.log("❌ No courses found.");
    return;
  }

  const courses = await prisma.course.findMany({});

  for (const courseDir of courseDirs) {
    if (courses.find((c) => c.title === courseDir)) {
      console.log(`❌ Course "${courseDir}" already exists.`);
      continue;
    }

    console.log(`🗃️ Scanning course: ${courseDir}`);
    const coursePath = path.join(rootDir, courseDir);
    const chapters = listDirectories(coursePath);

    if (chapters.length === 0) {
      console.log(`❌ No chapters found in course "${courseDir}".`);
      continue;
    }

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

      if (files.length === 0) {
        console.log(`❌ No files found in chapter "${name}".`);
      }

      for (const file of files) {
        const { name: lessonName, index: lessonIndex } = getNameAndIndex(file);
        const extension = path.extname(file).toLowerCase();
        if (videoExtensions.includes(extension)) {
          console.log(`📽️ Scanning lesson: ${lessonName}`);
          const lesson = await createLesson(
            chapter.id,
            lessonName,
            lessonIndex,
            path.join(courseDir, chapterDir, file)
          );
          lessonCount++;

          const subtitleFiles = files.filter((f) => {
            const baseName = path.basename(f, path.extname(f));
            const lessonBaseName = path.basename(file, path.extname(file));
            return (
              baseName.includes(lessonBaseName) &&
              subtitleExtensions.includes(path.extname(f).toLowerCase())
            );
          });

          console.log(
            `${subtitleFiles.length} subtitle files found for "${name}".`
          );

          for (const subtitleFile of subtitleFiles) {
            const subtitlePath = path.join(courseDir, chapterDir, subtitleFile);
            await linkSubtitleToLesson(lesson.id, subtitlePath);
          }

          const materialFiles = files.filter((f) => {
            const { index: materialIndex } = getNameAndIndex(f);
            const materialExtensions = [".pdf", ".docx", ".txt"]; // Add your material extensions here
            return (
              materialIndex === lessonIndex &&
              materialExtensions.includes(path.extname(f).toLowerCase())
            );
          });

          console.log(
            `${materialFiles.length} material files found for "${lessonName}".`
          );

          for (const materialFile of materialFiles) {
            const materialPath = path.join(courseDir, chapterDir, materialFile);
            try {
              await linkMaterialToLesson(lesson.id, materialPath);
            } catch (error) {
              console.error(
                `Error linking material file ${materialPath} to lesson ${lesson.id}: ${error}`
              );
            }
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
