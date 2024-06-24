"use server";

import prisma from "@/lib/prisma";

export default async function addComment({ comment }: { comment: string }) {
  console.log(comment);
  try {
    const createdComment = await prisma.comment.create({
      data: {
        lessonId: "clx37dgar0001yno91r8h1h9f",
        userId: "clx241x9d00004oxua7p1g48i",
        content: comment,
      },
    });
    if (!createdComment) {
      return {
        status: 400,
        data: null,
      };
    }
    return {
      status: 200,
      data: createdComment,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      data: null,
    };
  }
}
