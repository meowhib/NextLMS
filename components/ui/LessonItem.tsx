"use client";

import {
  AudioLines,
  CheckCheck,
  Circle,
  CircleCheckBig,
  CirclePlay,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LessonItem({
  lessonId,
  courseSlug,
  name,
  completed = false,
  isCurrent,
}: {
  lessonId: number;
  courseSlug: string;
  name: string;
  completed?: boolean;
  isCurrent: boolean;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.replace(`/courses/${courseSlug}/${lessonId}`, { scroll: false });
      }}
      className="p-4 hover:bg-gray-100 rounded-lg text-left transition-all cursor-pointer flex flex-row items-center space-x-2 group"
    >
      {isCurrent ? (
        <CirclePlay size={24} className="text-gray-600" /> // third icon for currently playing lesson
      ) : completed ? (
        <CheckCheck size={24} className="text-green-600" />
      ) : (
        <CheckCheck
          size={24}
          className="text-gray-100 transition-all group-hover:text-gray-300"
        />
      )}

      <p>{name}</p>
    </div>
  );
}
