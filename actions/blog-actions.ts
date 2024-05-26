import prisma from "@/lib/prisma";

export async function getBlogBySlug(slug: string) {
  return {
    status: 200,
    data: {
      title: "My Blog",
      content: "This is a blog post.",
    },
  };
}
