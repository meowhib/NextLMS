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
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
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
      const courseTitle = courseSlug.replace(/-/g, " ");
      const slugifiedCourseSlug = slugify(courseTitle, {
        lower: true,
        strict: true,
      });

      const course = await createOrUpdateCourse(
        slugifiedCourseSlug,
        courseTitle
      );
      console.log(`📚 Upserted course: "${course.title}"`);

      let chapterCount = 0;
      let lessonCount = 0;

      for (const [chapterSlug, lessonContents] of Object.entries(chapters)) {
        const { name: chapterName, index: chapterIndex } =
          getNameAndIndex(chapterSlug);
        let chapter = await prisma.chapter.findFirst({
          where: { courseId: course.id, index: chapterIndex },
        });

        if (!chapter) {
          chapter = await createChapter(course.id, chapterName, chapterIndex);
          chapterCount++;
          console.log(`  ✅ Created new chapter: "${chapterName}"`);
        } else {
          console.log(`  📖 Updating existing chapter: "${chapter.title}"`);
        }

        const allLessons = mergeByIndex(lessonContents);

        for (const lesson of allLessons) {
          const { name: lessonName, index: lessonIndex } = getNameAndIndex(
            lesson.path
          );
          let lessonData = await prisma.lesson.findFirst({
            where: { chapterId: chapter.id, index: lessonIndex },
          });

          if (!lessonData) {
            lessonData = await createLesson(
              chapter.id,
              lessonName,
              lessonIndex,
              `${courseSlug}/${chapterSlug}/${lesson.path}`,
              lesson.isAttachment,
              lesson.materials.map((m) => `${courseSlug}/${chapterSlug}/${m}`)
            );
            lessonCount++;
            console.log(
              `    ✅ Created new ${
                lesson.isAttachment ? "attachment" : "lesson"
              }: "${lessonName}"`
            );
          } else {
            console.log(
              `    📝 Updating existing ${
                lessonData.isAttachment ? "attachment" : "lesson"
              }: "${lessonData.title}"`
            );
          }

          // Update subtitles and materials
          await prisma.subtitle.deleteMany({
            where: { lessonId: lessonData.id },
          });
          await prisma.material.deleteMany({
            where: { lessonId: lessonData.id },
          });

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
        `✅ Course "${course.title}" scanned successfully with ${chapterCount} new chapters and ${lessonCount} new lessons.`
      );
    }
  } catch (error) {
    console.error("Error scanning courses:", error);
  }
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
    isAttachment: boolean;
  }[] = [];

  contents.videos.forEach((video) => {
    const { name, index } = getNameAndIndex(video);
    lessons.push({
      name,
      index,
      path: video,
      materials: [],
      subtitles: [],
      isAttachment: false,
    });
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

  // Add standalone attachments as lessons
  contents.materials.forEach((material) => {
    const { name, index } = getNameAndIndex(material);
    if (!lessons.some((lesson) => lesson.index === index)) {
      lessons.push({
        name,
        index,
        path: material,
        materials: [material],
        subtitles: [],
        isAttachment: true,
      });
    }
  });

  // Sort lessons by index
  lessons.sort((a, b) => a.index - b.index);

  return lessons;
}
