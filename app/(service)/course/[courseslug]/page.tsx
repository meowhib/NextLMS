import React from "react";
import Link from "next/link";
import { getCourse } from "@/actions/courses-actions";
import { Paperclip } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

interface CoursePageProps {
  params: {
    courseslug: string;
  };
}

const CoursePage = async ({ params }: CoursePageProps) => {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    return <div>Unauthorized</div>;
  }

  const { courseslug } = params;
  const course = await getCourse(courseslug, user.id);

  if (!course) {
    return <div>Course not found</div>;
  }

  console.log("Course data:", JSON.stringify(course, null, 2));

  const firstChapter = course.chapters[0];
  const firstLesson = firstChapter?.lessons[0];

  console.log("First chapter:", firstChapter);
  console.log("First lesson:", firstLesson);

  if (!firstChapter || !firstLesson) {
    return <div>No lessons available for this course</div>;
  }

  const firstChapterId = firstChapter.id;
  const firstLessonId = firstLesson.id;

  console.log("First chapter ID:", firstChapterId);
  console.log("First lesson ID:", firstLessonId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Course Overview: {course.title}
      </h1>

      {firstChapterId && firstLessonId ? (
        <Link
          href={`/course/${courseslug}/learn/${firstChapterId}/${firstLessonId}`}
        >
          <Button className="mt-4">Start Course</Button>
        </Link>
      ) : (
        <div>Unable to start course: Missing chapter or lesson information</div>
      )}

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Course Description</h2>
        <p className="text-gray-700">{course.description}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Chapters and Lessons</h2>
        <Accordion type="single" collapsible className="w-full">
          {course.chapters.map((chapter) => (
            <AccordionItem key={chapter.id} value={chapter.id}>
              <AccordionTrigger>{chapter.title}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {chapter.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex justify-between items-center"
                    >
                      <span>{lesson.title}</span>
                      {lesson.attachments.length > 0 && (
                        <span className="flex items-center text-sm text-gray-500">
                          <Paperclip className="w-4 h-4 mr-1" />
                          {lesson.attachments.length}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
};

export default CoursePage;
