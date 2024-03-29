"use server";

import prisma from "@/lib/prisma";

export async function getCourses() {
  const courses = await prisma.course.findMany({
  });

  return courses;
}