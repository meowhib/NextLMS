"use client";

import { CheckCheck, Circle, CircleCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LessonItem({
  lessonId,
  courseSlug,
  name,
  completed,
}: {
  lessonId: number;
  courseSlug: string;
  name: string;
  completed: boolean;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.replace(`/courses/${courseSlug}/${lessonId}`, { scroll: false });
        // window.history.replaceState(
        //   {
        //     ...window.history.state,
        //     as: `/courses/${courseSlug}/${lessonId}`,
        //     url: `/courses/${courseSlug}/${lessonId}`,
        //   },
        //   "",
        //   `/courses/${courseSlug}/${lessonId}`
        // );
      }}
      className="p-4 hover:bg-gray-100 rounded-lg text-left transition-all cursor-pointer flex flex-row space-x-2 group"
    >
      {completed ? (
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
