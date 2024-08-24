/*
  Warnings:

  - You are about to drop the column `latestLessonId` on the `Course` table. All the data in the column will be lost.
  - The primary key for the `Enrollment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Enrollment` table. All the data in the column will be lost.
  - The primary key for the `UserLessonProgress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserLessonProgress` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `UserLessonProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "latestLessonId",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("userId", "courseId");

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserLessonProgress" DROP CONSTRAINT "UserLessonProgress_pkey",
DROP COLUMN "id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "UserLessonProgress_pkey" PRIMARY KEY ("userId", "lessonId");
