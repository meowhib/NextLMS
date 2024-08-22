import React from "react";
import { CheckCircle, Circle, Play } from "lucide-react";
import Link from "next/link";

interface LessonCardProps {
  lessonId: string;
  courseSlug: string;
  title: string;
  isCompleted: boolean;
  isCurrentLesson: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lessonId,
  courseSlug,
  title,
  isCompleted,
  isCurrentLesson,
}) => {
  return (
    <Link href={`/course/${courseSlug}/learn/${lessonId}`}>
      <div
        className={`flex items-center p-3 rounded-lg transition-colors ${
          isCurrentLesson
            ? "bg-primary text-primary-foreground"
            : "hover:bg-secondary"
        }`}
      >
        <div className="mr-3">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : isCurrentLesson ? (
            <Play className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </div>
        <span className="flex-grow">{title}</span>
      </div>
    </Link>
  );
};

export default LessonCard;
