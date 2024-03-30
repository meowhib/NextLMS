import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import VideoComponent from "@/components/ui/video";
import { getCourse } from "@/actions/courses-actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLesson } from "@/actions/lessons.actions";
import { Circle, CircleCheckBig } from "lucide-react";

export default async function CoursesPage({
  params: { slug, lessonId },
}: {
  params: {
    slug: string;
    lessonId: string;
  };
}) {
  // const videoURL = "https://dlsu5svezbvdk.cloudfront.net/4+-+Important+Message.mp4";
  const course = await getCourse(slug);

  if (!course) {
    redirect("/dashboard");
  }

  const lesson = await getLesson(lessonId);

  if (!lesson) {
    redirect(`/courses/${slug}`);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="flex-none col-span-4 space-y-4 rounded-lg">
          <AspectRatio
            ratio={16 / 9}
            className="bg-muted rounded-lg bg-gray-600 overflow-hidden"
          >
            <video
              src={`/api/video?lessonPath=${
                course.name + "/" + lesson.chapter.name + "/" + lesson.name
              }`}
            ></video>
          </AspectRatio>
          <h1 className="text-3xl font-semibold">{lesson.name}</h1>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Notes:</h1>
            <Textarea className="w-full" />
          </div>
        </div>
        <div className="p-2 col-span-2 bg-gray-100 rounded-lg max-h-lvh relative">
          <ScrollArea className="flex-1 bg-white rounded-lg h-full fixed">
            <Accordion type="single" collapsible>
              {course.chapters.map((chapter) => (
                <AccordionItem value={chapter.id.toString()} key={chapter.id}>
                  <AccordionTrigger className="px-4">
                    <h1 className="text-lg font-semibold no-underline">
                      {chapter.name}
                    </h1>
                  </AccordionTrigger>
                  <AccordionContent>
                    {chapter.lessons.map((lesson) => (
                      <Link
                        href={`/courses/${slug}/${lesson.id}`}
                        key={lesson.id}
                      >
                        <div className="p-4 hover:bg-gray-200 rounded-lg text-left transition-all cursor-pointer flex flex-row space-x-2">
                          {lesson.completed ? (
                            <CircleCheckBig
                              size={24}
                              className="text-gray-400"
                            />
                          ) : (
                            <Circle size={24} className="text-gray-400" />
                          )}
                          <p>{lesson.name}</p>
                        </div>
                      </Link>
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
