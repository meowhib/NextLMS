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
  accessKey: "YOUR_ROOT_USER",
  secretKey: "YOUR_ROOT_PASSWORD",
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

// export async function scanBucketCourses() {
//   console.log("🔍 Scanning courses...");

//   try {
//     const courses = await prisma.course.findMany({});
//     const existingCourses = new Set(courses.map((c) => c.slug));

//     const bucketExists = await minioClient.bucketExists(bucketName);
//     if (!bucketExists) {
//       console.log(`❌ Bucket "${bucketName}" does not exist.`);
//       return;
//     }

//     const courseDirs = await listDirectories(bucketName, "");

//     if (courseDirs.length === 0) {
//       console.log("❌ No courses found.");
//       return;
//     }

//     console.log(`📚 Found ${courseDirs.length} courses.`);

//     for (const courseDir of courseDirs) {
//       const slug = slugify(courseDir, { lower: true, strict: true });

//       if (existingCourses.has(slug)) {
//         console.log(`❌ Course "${courseDir}" already exists.`);
//         continue;
//       }

//       console.log(`🗃️ Scanning course: ${courseDir}`);
//       console.log("Prefix: ", `${courseDir}/`);
//       const chapterDirs = await listDirectories(bucketName, `${courseDir}/`);

//       if (chapterDirs.length === 0) {
//         console.log(`❌ No chapters found in course "${courseDir}".`);
//         continue;
//       }

//       const course = await createCourse(slug, courseDir);
//       let chapterCount = 0;
//       let lessonCount = 0;

//       for (const chapterDir of chapterDirs) {
//         const { name, index } = getNameAndIndex(chapterDir);
//         console.log(`📗 Scanning chapter: ${name}`);

//         const chapter = await createChapter(course.id, name, index);
//         chapterCount++;

//         const files = await listFiles(
//           bucketName,
//           `${courseDir}/${chapterDir}/`
//         );

//         if (files.length === 0) {
//           console.log(`❌ No files found in chapter "${name}".`);
//         } else {
//           // ... handle files ...
//         }
//       }

//       console.log(
//         `✅ Course "${courseDir}" scanned successfully with ${chapterCount} chapters and ${lessonCount} lessons.`
//       );
//     }
//   } catch (error) {
//     console.error("Error scanning courses:", error);
//   }
// }

export async function scanBucketCourses() {
  console.log("🔍 Scanning courses...");

  // Get all courses from the courses bucket
  const stream = minioClient.listObjectsV2(bucketName, "", true);
  const coursesChaptersLessons: Record<string, Record<string, string[]>> = {};

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
      coursesChaptersLessons[courseSlug][chapterSlug] = [];
    }

    coursesChaptersLessons[courseSlug][chapterSlug].push(lessonName);
  }

  console.log(coursesChaptersLessons);

  for (const [courseSlug, chapters] of Object.entries(coursesChaptersLessons)) {
    // Insert the course
    const courseId = await createCourse(
      slugify(courseSlug, { lower: true, strict: true }),
      courseSlug
    );

    for (const [chapterSlug, lessons] of Object.entries(chapters)) {
      // Insert the chapter
      const chapterId = await createChapter(
        courseId.id,
        chapterSlug,
        getNameAndIndex(chapterSlug).index
      );

      for (const lessonName of lessons) {
        // Insert the lesson
        await createLesson(
          chapterId.id,
          lessonName,
          getNameAndIndex(lessonName).index,
          courseId.title + "/" + chapterSlug + "/" + lessonName
        );
      }
    }
  }
}
