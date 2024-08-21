"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { enrollInCourse } from "@/actions/enrollment-actions";

export function EnrollButton({ courseId }: { courseId: string }) {
  return (
    <Button onClick={() => enrollInCourse(courseId)}>
      <PlusIcon className="h-4 w-4 mr-2" />
      Add to my courses
    </Button>
  );
}
