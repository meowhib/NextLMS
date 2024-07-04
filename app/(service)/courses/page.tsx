import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CoursesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  if (!user || !user.id) {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({});
}
