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
import { enrollInCourse } from "@/actions/enrollment-actions";
import { EnrollButton } from "@/components/EnrollButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const enrolledCourses = await getEnrolledCourses(session.user.id);
  const availableCourses = await getCourses();

  const numberOfCourses = enrolledCourses.length;
  const numberOfLessons = enrolledCourses.reduce(
    (acc, course) =>
      acc +
      course.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0),
    0
  );
  const numberOfCompletedLessons = enrolledCourses.reduce(
    (acc, course) =>
      acc +
      course.chapters.reduce(
        (acc, chapter) =>
          acc + chapter.lessons.filter((lesson) => lesson.completed).length,
        0
      ),
    0
  );
  const numberOfSecondsLearned = enrolledCourses.reduce(
    (acc, course) =>
      acc +
      course.chapters.reduce(
        (chapterAcc, chapter) =>
          chapterAcc +
          chapter.lessons.reduce(
            (lessonAcc, lesson) =>
              lessonAcc + (lesson.progress[0]?.progressSeconds || 0),
            0
          ),
        0
      ),
    0
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Minutes learned
            </CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {numberOfSecondsLearned / 60}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lessons completed
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfCompletedLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total lessons</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfCourses}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold leading-none tracking-tight">
          Enrolled Courses
        </h1>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {enrolledCourses.map((course) => (
            <Link
              href={`/courses/${course.slug}/${course.chapters[0]?.lessons[0]?.id}`}
              key={course.slug}
              passHref={true}
            >
              <Card className="group">
                <CardHeader className="relative">
                  <CardTitle className="font-bold line-clamp-2 flex flex-row items-center justify-between space-y-0 pb-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={50} className="h-2">
                    <div className="mb-1 flex w-full justify-between">
                      <Label className="text-sm">Progress</Label>
                      <span className="text-sm">60%</span>
                    </div>
                  </Progress>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold leading-none tracking-tight">
          Available Courses
        </h1>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {availableCourses.map((course) => (
            <Card key={course.slug} className="group">
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
          ))}
        </div>
      </div>
    </main>
  );
}
