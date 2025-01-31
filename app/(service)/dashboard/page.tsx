import Link from "next/link";
import {
  PlusIcon,
  Hourglass,
  ListChecks,
  Presentation,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { getEnrolledCourses, getCourses } from "@/actions/courses-actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EnrollButton } from "@/components/EnrollButton";
import { Course } from "@/types/course";
import { EnrolledCourse, DashboardCourse } from "@/types/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/signin");
  }

  const enrolledCourses = await getEnrolledCourses(session.user.id) as EnrolledCourse[];
  const availableCourses = await getCourses() as Course[];

  // Filter out enrolled courses from available courses
  const unenrolledCourses = availableCourses.filter(
    (course: Course) => !enrolledCourses.some((enrolled: EnrolledCourse) => enrolled.id === course.id)
  );

  const numberOfCourses: number = enrolledCourses.length;
  const numberOfLessons: number = enrolledCourses.reduce(
    (acc: number, course: EnrolledCourse) =>
      acc +
      course.chapters.reduce((acc: number, chapter) => acc + chapter.lessons.length, 0),
    0
  );
  const numberOfCompletedLessons: number = enrolledCourses.reduce(
    (acc: number, course: EnrolledCourse) =>
      acc +
      course.chapters.reduce(
        (acc: number, chapter) =>
          acc +
          chapter.lessons.filter((lesson) => lesson.progress[0]?.completed)
            .length,
        0
      ),
    0
  );
  const numberOfSecondsLearned: number = enrolledCourses.reduce(
    (acc: number, course: EnrolledCourse) =>
      acc +
      course.chapters.reduce(
        (chapterAcc: number, chapter) =>
          chapterAcc +
          chapter.lessons.reduce(
            (lessonAcc: number, lesson) =>
              lessonAcc + (lesson.progress[0]?.progressSeconds || 0),
            0
          ),
        0
      ),
    0
  );

  const numberOfEnrolledCourses: number = enrolledCourses.length;
  const numberOfUnenrolledCourses: number = availableCourses.length - numberOfEnrolledCourses;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Minutes learned
            </CardTitle>
            <Hourglass className="h-4 w-4 text-[hsl(var(--chart-1))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(numberOfSecondsLearned / 60)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lessons completed
            </CardTitle>
            <ListChecks className="h-4 w-4 text-[hsl(var(--chart-2))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfCompletedLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total lessons</CardTitle>
            <Presentation className="h-4 w-4 text-[hsl(var(--chart-3))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled courses
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-[hsl(var(--chart-4))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfEnrolledCourses}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold leading-none tracking-tight">
          Enrolled Courses
        </h1>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {enrolledCourses.map((course) => {
            const totalLessons: number = course.chapters.reduce(
              (acc: number, chapter) => acc + chapter.lessons.length,
              0
            );
            const completedLessons: number = course.chapters.reduce(
              (acc: number, chapter) =>
                acc +
                chapter.lessons.filter(
                  (lesson) => lesson.progress[0]?.completed
                ).length,
              0
            );
            const progressPercentage: number = (completedLessons / totalLessons) * 100;

            // Get first lesson ID as fallback
            const firstLessonId: string | undefined = course.chapters[0]?.lessons[0]?.id;
            // Use last studied lesson or fall back to first lesson
            const targetLessonId: string | null | undefined = course.lastStudiedLessonId ?? firstLessonId;

            // console.log(`Course ${course.slug}:`, {
            //   lastStudiedLessonId: course.lastStudiedLessonId,
            //   firstLessonId,
            //   targetLessonId,
            //   chaptersCount: course.chapters.length,
            //   firstChapterLessons: course.chapters[0]?.lessons.length
            // });

            if (!targetLessonId) {
              return null; // Skip rendering if no lessons available
            }

            const href: string = course.lastStudiedLessonId 
              ? `/course/${course.slug}/learn/${course.lastStudiedLessonId}`
              : firstLessonId 
                ? `/course/${course.slug}/learn/${firstLessonId}`
                : `/course/${course.slug}`;

            return (
              <Link
                href={href}
                key={course.slug}
              >
                <Card className="group size-full flex flex-col justify-between">
                  <CardHeader className="relative">
                    <CardTitle className="font-bold line-clamp-2 flex flex-row items-center justify-between space-y-0 pb-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-sm text-muted-foreground">
                      {completedLessons} / {totalLessons} lessons completed
                    </div>
                    <Progress value={progressPercentage} className="h-2">
                      <div className="mb-1 flex w-full justify-between">
                        <Label className="text-sm">Progress</Label>
                        <span className="text-sm">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                    </Progress>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {unenrolledCourses.length > 0 && (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-none tracking-tight">
            Available Courses
          </h1>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {unenrolledCourses.map((course: Course) => (
              <Link href={`/course/${course.slug}`} key={course.slug}>
                <Card className="group">
                  <CardHeader>
                    <CardTitle className="font-bold line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 mb-4">{course.description}</p>
                    <EnrollButton courseId={course.id} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
