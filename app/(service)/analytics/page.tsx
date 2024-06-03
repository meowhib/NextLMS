import prisma from "@/lib/prisma";

export default async function Analytics(){
    const numberOfCourses=await prisma.course.count();
    const numberOfLessons=await prisma.lesson.count();
    const numberOfChapters=await prisma.chapter.count();
    return(
        <div>
            <h1>number of courses: {numberOfCourses}</h1>
            <h1>number of lessons: {numberOfLessons}</h1>
            <h1>number of chapters: {numberOfChapters}</h1>
        </div>
    )
}