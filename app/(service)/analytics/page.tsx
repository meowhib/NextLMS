import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
type Course = {
    id: string,
    title: string,
    latestLessonId: string
}

export default async function Analytics(){
    const courses = await prisma.course.findMany();
    console.log(courses)
    const numberOfCourses=await prisma.course.count();
    const numberOfLessons=await prisma.lesson.count();
    const numberOfChapters=await prisma.chapter.count();
    return(
        // <div>
        //     <h1>number of courses: {numberOfCourses}</h1>
        //     <h1>number of lessons: {numberOfLessons}</h1>
        //     <h1>number of chapters: {numberOfChapters}</h1>
        //     <h1>number of chapters: {numberOfChapters}</h1>
        //     {
        //         courses.map((course: Course) => {
        //             return (
        //                 <h1 key={course.id}>{course.slug}</h1>
        //             )
        //         })
        //     }
        // </div>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
        <CardContent>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
            number of courses
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {numberOfCourses}
            </div>
           
          </CardContent>
        </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
            number of lessons
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfLessons}</div>
           
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">number of chapters</CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfChapters}</div>
            
          </CardContent>
        </Card>
        </div>
        
          <div>
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{
                 courses.map((course: Course) => {
                     return (
                         <h1 key={course.id}>{course.title}</h1>
                   )
                 })
            }</div>
            
          </CardContent>
        </Card>
          </div>
        </main>
    )
}