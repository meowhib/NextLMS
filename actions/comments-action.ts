"use server";

import { commentFormSchema } from "@/components/CommentForm";
import prisma from "@/lib/prisma";
import { z } from "zod";

export default async function createComment({ comment }: { comment: string }) {
  console.log(comment);
  try {
    const createdComment = await prisma.comment.create({
      data: {
        lessonId: "clwrqvv1x003yb2itrw1ccihm",
        userId: "clx244gkc0000f86j7rbdcm4e",
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
    console.error(error);
    return {
      status: 500,
      data: null,
    };
  }
}
