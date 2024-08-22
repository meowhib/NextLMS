import { getCourse } from "@/actions/courses-actions";
import { getLesson } from "@/actions/lessons-actions";
import VideoComponent from "@/components/VideoComponent";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LessonPageProps {
  params: {
    courseslug: string;
    lessonsid: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/signin");
  }

  const { courseslug, lessonsid } = params;
  const course = await getCourse(courseslug, session.user.id);
  const lesson = await getLesson(lessonsid);

  if (!course || !lesson) {
    return <div>Course or lesson not found</div>;
  }

  // Find the index of the chapter containing the current lesson
  const currentChapterIndex = course.chapters.findIndex((chapter) =>
    chapter.lessons.some((l) => l.id === lesson.id)
  );

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row lg:space-x-8">
      {/* Main content */}
      <div className="w-full lg:w-2/3 mb-8 lg:mb-0">
        <div className="aspect-w-16 aspect-h-9 mb-6">
          <VideoComponent
            src={`http://localhost:9000/courses/${lesson.videoPath}`}
            lessonId={lesson.id}
            courseSlug={course.slug}
          />
        </div>
        <h2 className="text-2xl font-semibold mb-6">{lesson.title}</h2>
        {/* Add more lesson content here */}
        <div className="prose max-w-none">
          <p>Lesson content goes here...</p>
        </div>
      </div>

      {/* Sidebar with Accordion */}
      <div className="w-full lg:w-1/3">
        <div className="sticky top-20">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="pr-4">
              <h3 className="text-xl font-semibold mb-4">Course Content</h3>
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={`chapter-${currentChapterIndex}`}
              >
                {course.chapters.map((chapter, index) => (
                  <AccordionItem key={chapter.id} value={`chapter-${index}`}>
                    <AccordionTrigger className="text-left">
                      {chapter.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {chapter.lessons.map((chapterLesson) => (
                          <li key={chapterLesson.id}>
                            <Link
                              href={`/course/${course.slug}/learn/${chapterLesson.id}`}
                              className={`block p-2 rounded transition-colors ${
                                chapterLesson.id === lesson.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-secondary"
                              }`}
                            >
                              {chapterLesson.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}