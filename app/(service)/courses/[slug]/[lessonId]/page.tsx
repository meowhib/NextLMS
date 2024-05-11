import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getCourse } from "@/actions/courses-actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLesson } from "@/actions/lessons-actions";
import LessonItem from "@/components/ui/LessonItem";
import ReactPlayer from "react-player";
import VideoComponent from "@/components/VideoComponent";

export default async function CoursesPage({
  params: { slug, lessonId },
}: {
  params: {
    slug: string;
    lessonId: string;
  };
}) {
  const course = await getCourse(slug);

  if (!course) {
    redirect("/dashboard");
  }

  const lessonData = await getLesson(lessonId);

  if (!lessonData) {
    redirect(`/courses/${slug}`);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="flex-none col-span-6 md:col-span-4 space-y-4 rounded-lg">
          <AspectRatio
            ratio={16 / 9}
            className="bg-muted rounded-lg bg-gray-600 overflow-hidden"
          >
            <VideoComponent src={"/courses/" + lessonData.videoPath} />
          </AspectRatio>
          <h1 className="text-3xl font-semibold">{lessonData.title}</h1>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Notes:</h1>
            <Textarea className="w-full" />
          </div>
        </div>
        <div className="p-2 col-span-6 md:col-span-2 bg-gray-100 rounded-lg max-h-lvh relative w-full">
          <ScrollArea className="flex-1 bg-white rounded-lg h-full fixed w-full">
            <Accordion
              type="single"
              collapsible
              defaultValue={lessonData.chapterId.toString()}
            >
              {course.chapters.map((chapter) => (
                <AccordionItem key={chapter.id} value={chapter.id.toString()}>
                  <AccordionTrigger
                    className="p-6"
                    value={chapter.id.toString()}
                  >
                    <h1 className="text-lg font-semibold">{chapter.title}</h1>
                  </AccordionTrigger>
                  <AccordionContent>
                    {chapter.lessons.map((lesson) => (
                      <LessonItem
                        key={lesson.id}
                        courseSlug={slug}
                        lessonId={lesson.id as unknown as number}
                        name={lesson.title}
                        completed={lesson.completed}
                        isCurrent={lesson.id === lessonData.id}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}
