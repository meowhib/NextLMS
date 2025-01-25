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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon } from "@/components/FileIcon";
import { getFileIcon } from "@/lib/utils";
import Link from "next/link";
import { getNameAndIndex } from "@/lib/scanners";
import path from "path";
import {
  CheckCircle,
  ChevronDown,
  FolderIcon,
  PlayCircle,
  Paperclip,
} from "lucide-react";

interface LessonPageProps {
  params: {
    courseslug: string;
    lessonsid: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const MINIO_STORAGE_URL = process.env.MINIO_ENDPOINT;

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
            src={`${MINIO_STORAGE_URL}/courses/${lesson.videoPath}`}
            lessonId={lesson.id}
            courseSlug={course.slug}
          />
        </div>
        <h2 className="text-2xl font-semibold mb-6">{lesson.title}</h2>
        {/* Add more lesson content here */}
        <div className="prose max-w-none mb-6">
          <p>Lesson content goes here...</p>
        </div>

        {/* Attachments section */}
        {lesson.attachments ? (
          lesson.attachments.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Lesson Attachments</h3>
              <ul className="space-y-2">
                {lesson.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <a
                      href={`${MINIO_STORAGE_URL}/courses/${attachment.path}`}
                      download
                      className="flex items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <FileIcon
                        iconType={getFileIcon(path.extname(attachment.path))}
                      />
                      <span className="ml-2">
                        {path.basename(attachment.path)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-8">No attachments for this lesson.</div>
          )
        ) : (
          <div className="mt-8">Error: Attachments data is undefined.</div>
        )}
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
                {course.chapters.map((chapter, chapterIndex) => (
                  <AccordionItem
                    key={chapter.id}
                    value={`chapter-${chapterIndex}`}
                  >
                    <AccordionTrigger className="text-left">
                      <div className="flex justify-between w-full">
                        <span>{chapter.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {
                            chapter.lessons.filter(
                              (lesson) => lesson.progress[0]?.completed
                            ).length
                          }
                          /{chapter.lessons.length}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {chapter.lessons.map((chapterLesson) => (
                          <li key={chapterLesson.id}>
                            {chapterLesson.isAttachment ? (
                              <a
                                href={`${process.env.MINIO_STORAGE_URL}/courses/${chapterLesson.videoPath}`}
                                download
                              >
                                <Button
                                  variant="ghost"
                                  className="w-full justify-between"
                                >
                                  <div className="flex items-center">
                                    <FileIcon
                                      iconType={getFileIcon(
                                        path.extname(chapterLesson.videoPath)
                                      )}
                                    />
                                    <span className="ml-2">
                                      {chapterLesson.title}
                                    </span>
                                  </div>
                                </Button>
                              </a>
                            ) : (
                              <div className="flex items-center justify-between">
                                <Link
                                  href={`/course/${course.slug}/learn/${chapterLesson.id}`}
                                  className="flex-grow"
                                >
                                  <Button
                                    variant="ghost"
                                    className={`w-full justify-start ${
                                      chapterLesson.id === lesson.id
                                        ? "bg-secondary"
                                        : ""
                                    }`}
                                  >
                                    {chapterLesson.progress[0]?.completed ? (
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    ) : (
                                      <PlayCircle className="mr-2 h-4 w-4" />
                                    )}
                                    {chapterLesson.title}
                                  </Button>
                                </Link>
                                {chapterLesson.attachments.length > 0 && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2"
                                      >
                                        <Paperclip className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      {chapterLesson.attachments.map((file) => (
                                        <DropdownMenuItem key={file.id}>
                                          <a
                                            href={`${process.env.MINIO_STORAGE_URL}/courses/${file.path}`}
                                            download
                                            className="flex items-center"
                                          >
                                            <FileIcon
                                              iconType={getFileIcon(
                                                path.extname(file.path)
                                              )}
                                            />
                                            <span className="ml-2">
                                              {file.path.split("/").pop()}
                                            </span>
                                          </a>
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            )}
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
