import * as Minio from "minio";
import { getNameAndIndex } from "@/lib/scanners";
var slugify = require("slugify");
import prisma from "./prisma";
import path from "path";
import {
  videoExtensions,
  subtitleExtensions,
  materialExtensions,
} from "./constants";
import {
  createCourse,
  createChapter,
  createLesson,
  linkMaterialToLesson,
  linkSubtitleToLesson,
} from "@/lib/scanners";

const bucketName = "courses";

const minioClient = new Minio.Client({
  endPoint: "minio-i8cosgww80cco80k08w8kkgk.coolify.professionnal.net",
  port: 9000,
  useSSL: true,
  accessKey: process.env.MINIO_ADMIN_USER || "",
  secretKey: process.env.MINIO_ADMIN_PASSWORD || "",
});

export async function listObjects(bucketName: string, prefix: string) {
  const objects = minioClient.listObjectsV2(bucketName, prefix, true);

  console.log(objects);
  return objects;
}

export async function listDirectories(
  bucketName: string,
  prefix: string
): Promise<string[]> {
  const stream = minioClient.listObjectsV2(bucketName, prefix, true);
  const objects: string[] = [];

  for await (const obj of stream) {
    if (!obj.isDir) {
      objects.push(obj.name);
    }
  }

  console.log(objects);
  return objects;
}

export async function listDirectoriesRecursive(bucketName: string) {
  const stream = minioClient.listObjectsV2("courses", "", true);
  stream.on("data", async function (obj) {
    if (!obj.name) {
      return;
    }

    const parts = obj.name.split("/");
    const course = parts[0];
    const chapter = parts[1];
    const lesson = parts[2];

    const isVideo = videoExtensions.includes(path.extname(obj.name));
    const isSubtitle = subtitleExtensions.includes(path.extname(obj.name));
    const isMaterial = materialExtensions.includes(path.extname(obj.name));

    const courseSlug = slugify(course, { lower: true, strict: true });
    const chapterNameAndIndex = getNameAndIndex(chapter);
    const lessonNameAndIndex = getNameAndIndex(lesson);

    if (isVideo) {
    }
  });
  stream.on("error", function (err) {
    console.log(err);
  });
}

export async function listFiles(
  bucketName: string,
  prefix = ""
): Promise<{ key: string; size: number }[]> {
  const stream = minioClient.listObjects(bucketName, prefix, false);
  const files: { key: string; size: number }[] = [];

  for await (const obj of stream) {
    if (obj.key && !obj.isDir) {
      files.push({ key: obj.key, size: obj.size });
    }
  }

  return files;
}

export async function scanBucketCourses() {
  console.log("🔍 Scanning courses...");

  try {
    const courses = await prisma.course.findMany({});
    const existingCourses = new Set(courses.map((c) => c.slug));

    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      console.log(`❌ Bucket "${bucketName}" does not exist.`);
      return;
    }

    const stream = minioClient.listObjectsV2(bucketName, "", true);
    const coursesChaptersLessons: Record<
      string,
      Record<
        string,
        { videos: string[]; materials: string[]; subtitles: string[] }
      >
    > = {};

    for await (const obj of stream) {
      if (!obj.name) {
        continue;
      }

      const parts = obj.name.split("/");
      const courseSlug = parts[0];
      const chapterSlug = parts[1];
      const lessonName = parts[2];

      if (!coursesChaptersLessons[courseSlug]) {
        coursesChaptersLessons[courseSlug] = {};
      }

      if (!coursesChaptersLessons[courseSlug][chapterSlug]) {
        coursesChaptersLessons[courseSlug][chapterSlug] = {
          videos: [],
          materials: [],
          subtitles: [],
        };
      }

      const extension = path.extname(lessonName).toLowerCase();
      if (videoExtensions.includes(extension)) {
        coursesChaptersLessons[courseSlug][chapterSlug].videos.push(lessonName);
      } else if (subtitleExtensions.includes(extension)) {
        coursesChaptersLessons[courseSlug][chapterSlug].subtitles.push(
          lessonName
        );
      } else if (materialExtensions.includes(extension)) {
        coursesChaptersLessons[courseSlug][chapterSlug].materials.push(
          lessonName
        );
      }
    }

    for (const [courseSlug, chapters] of Object.entries(
      coursesChaptersLessons
    )) {
      if (existingCourses.has(courseSlug)) {
        console.log(`❌ Course "${courseSlug}" already exists.`);
        continue;
      }

      const courseTitle = courseSlug.replace(/-/g, " ");
      const slugifiedCourseSlug = slugify(courseTitle, {
        lower: true,
        strict: true,
      });
      const course = await createCourse(slugifiedCourseSlug, courseTitle);
      let chapterCount = 0;
      let lessonCount = 0;

      for (const [chapterSlug, lessonContents] of Object.entries(chapters)) {
        const { name: chapterName, index: chapterIndex } =
          getNameAndIndex(chapterSlug);
        const chapter = await createChapter(
          course.id,
          chapterName,
          chapterIndex
        );
        chapterCount++;

        const allLessons = mergeByIndex(lessonContents);

        for (const lesson of allLessons) {
          const { name: lessonName, index: lessonIndex } = getNameAndIndex(
            lesson.path
          );
          const lessonData = await createLesson(
            chapter.id,
            lessonName,
            lessonIndex,
            `${courseSlug}/${chapterSlug}/${lesson.path}`
          );
          lessonCount++;

          for (const subtitle of lesson.subtitles) {
            await linkSubtitleToLesson(
              lessonData.id,
              `${courseSlug}/${chapterSlug}/${subtitle}`
            );
          }

          for (const material of lesson.materials) {
            await linkMaterialToLesson(
              lessonData.id,
              `${courseSlug}/${chapterSlug}/${material}`
            );
          }
        }
      }

      console.log(
        `✅ Course "${courseSlug}" scanned successfully with ${chapterCount} chapters and ${lessonCount} lessons.`
      );
    }
  } catch (error) {
    console.error("Error scanning courses:", error);
  }
}

function mergeByIndex(contents: {
  videos: string[];
  materials: string[];
  subtitles: string[];
}) {
  const lessons: {
    name: string;
    index: number;
    path: string;
    materials: string[];
    subtitles: string[];
  }[] = [];

  contents.videos.forEach((video) => {
    const { name, index } = getNameAndIndex(video);
    lessons.push({ name, index, path: video, materials: [], subtitles: [] });
  });

  lessons.forEach((lesson) => {
    contents.materials.forEach((material) => {
      const { index } = getNameAndIndex(material);
      if (index === lesson.index) {
        lesson.materials.push(material);
      }
    });

    contents.subtitles.forEach((subtitle) => {
      const { index } = getNameAndIndex(subtitle);
      if (index === lesson.index) {
        lesson.subtitles.push(subtitle);
      }
    });
  });

  return lessons;
}
