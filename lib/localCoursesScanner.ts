import * as path from "path";
import prisma from "./prisma";
var slugify = require("slugify");
import {
  videoExtensions,
  subtitleExtensions,
  materialExtensions,
} from "./constants";
import {
  listDirectories,
  listFiles,
  getNameAndIndex,
  createCourse,
  createChapter,
  createLesson,
  linkSubtitleToLesson,
  linkMaterialToLesson,
} from "@/lib/scanners";

const rootDir = "public/courses";

export async function scanLocalCourses() {
  const courseDirs = listDirectories(rootDir);
  console.log("🔍 Scanning courses...");

  if (courseDirs.length === 0) {
    console.log("❌ No courses found.");
    return;
  }

  const courses = await prisma.course.findMany({});

  for (const courseDir of courseDirs) {
    if (
      courses.find(
        (c: any) => c.slug === slugify(courseDir, { lower: true, strict: true })
      )
    ) {
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
          const materialFiles = files.filter((f: string) => {
            const { index: materialIndex } = getNameAndIndex(f);
            return (
              materialIndex === lessonIndex &&
              materialExtensions.includes(path.extname(f).toLowerCase())
            );
          });
          const lesson = await createLesson(
            chapter.id,
            lessonName,
            lessonIndex,
            path.join(courseDir, chapterDir, file),
            false,
            materialFiles.map((f) => path.join(courseDir, chapterDir, f))
          );
          lessonCount++;

          const subtitleFiles = files.filter((f: string) => {
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
