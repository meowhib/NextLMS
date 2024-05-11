import Link from "next/link";
import {
  PlusIcon,
  Hourglass,
  ListChecks,
  Presentation,
  GraduationCap,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { getCourses } from "@/actions/courses-actions";

export default async function DashboardPage() {
  const courses = await getCourses();
  const numberOfCourses = courses.length;
  const numberOfLessons = courses.reduce(
    (acc, course) =>
      acc +
      course.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0),
    0
  );
  const numberOfCompletedLessons = courses.reduce(
    (acc, course) =>
      acc +
      course.chapters.reduce(
        (acc, chapter) =>
          acc +
          chapter.lessons.reduce(
            (acc, lesson) => (lesson.completed ? acc + 1 : acc),
            0
          ),
        0
      ),
    0
  );
  // numberOfMinutesLearned by summing up the duration of all completed lessons
  const numberOfSecondsLearned = courses.reduce(
    (acc, course) =>
      acc +
      course.chapters.reduce(
        (acc, chapter) =>
          acc +
          chapter.lessons.reduce(
            (acc, lesson) =>
              lesson.completed ? acc + lesson.userProgressSeconds : acc,
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
            {/* <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p> */}
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
            {/* <p className="text-xs text-muted-foreground">
              +54.1% from last month
            </p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total lessons</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfLessons}</div>
            {/* <p className="text-xs text-muted-foreground">
              +19% from last month
            </p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfCourses}</div>
            {/* <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p> */}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold leading-none tracking-tight">
          Courses
        </h1>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course, index) => (
            <Link
              href={`/courses/${course.slug}/${
                course.latestLessonId
                  ? course.latestLessonId
                  : course.chapters[0]?.lessons[0]?.id
              }`}
              key={course.slug}
              passHref={true}
            >
              <Card className="group">
                <CardHeader className="relative">
                  <CardTitle className="font-bold line-clamp-1 flex flex-row items-center justify-between space-y-0 pb-2">
                    {course.title}
                    {/* <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-0 top-0 m-4 group-hover:flex hidden"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </Button> */}
                  </CardTitle>
                  {/* <CardDescription className="line-clamp-2">
                    Course description here
                  </CardDescription> */}
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
          <div className="w-full h-full bg-gray-300 hover:bg-gray-400 hover:transition-all duration-150 rounded-lg relative">
            <div className="absolute w-full h-full flex justify-center items-center">
              <Button className="bg-gray-0 hover:bg-gray-0 text-gray-900 h-full w-full font-semibold">
                <PlusIcon className="h-4 h-w mr-2" />
                Add new course
              </Button>
            </div>
            <Card className="invisible">
              <CardHeader>
                <CardTitle className="font-bold">Hidden</CardTitle>
                <CardDescription>Hidden</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={0} className="h-2">
                  <div className="mb-1 flex w-full justify-between">
                    <Label className="text-sm">Progress</Label>
                    <span className="text-sm">60%</span>
                  </div>
                </Progress>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
