import Link from "next/link";
import {
  Activity,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  PlusIcon,
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

export default function DashboardPage() {
  const courses = [
    {
      title: "React for Designers",
      description: "Learn how to build a modern React application.",
      progress: 75,
      slug: "react-for-designers",
    },
    {
      title: "Vue for Designers",
      description: "Learn how to build a modern Vue application.",
      progress: 50,
      slug: "vue-for-designers",
    },
    {
      title: "Angular for Designers",
      description: "Learn how to build a modern Angular application.",
      progress: 25,
      slug: "angular-for-designers",
    },
    {
      title: "Svelte for Designers",
      description: "Learn how to build a modern Svelte application.",
      progress: 10,
      slug: "svelte-for-designers",
    },
    {
      title: "Next.js for Designers",
      description: "Learn how to build a modern Next.js application.",
      progress: 90,
      slug: "next-js-for-designers",
    },
    {
      title: "Nuxt.js for Designers",
      description: "Learn how to build a modern Nuxt.js application.",
      progress: 80,
      slug: "nuxt-js-for-designers",
    },
    {
      title: "Gatsby for Designers",
      description: "Learn how to build a modern Gatsby application.",
      progress: 70,
      slug: "gatsby-for-designers",
    },
    {
      title: "Gridsome for Designers",
      description: "Learn how to build a modern Gridsome application.",
      progress: 60,
      slug: "gridsome-for-designers",
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Minutes learned
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1789</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lessons completed
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              +54.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total lessons</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">258</div>
            {/* <p className="text-xs text-muted-foreground">
              +19% from last month
            </p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total courses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
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
              href={"/courses/" + course.slug}
              key={course.slug}
              passHref={true}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold line-clamp-1">
                    {course.title}
                  </CardTitle>
                  {course.description && (
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Progress value={course.progress} className="h-2">
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
