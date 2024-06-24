"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";
import { Lesson, User } from "@/types";
import addComment from "@/app/actions";

const formSchema = z.object({
  comment: z.string().min(5).max(255),
});

export function CommentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { status, data } = await addComment({ comment: values.comment });
    if (status !== 200 || !data) {
      alert("could not create comment");
      return;
    }
    alert("comment created : " + data.content);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl font-semibold">Comments</FormLabel>
              <FormControl>
                <Input
                  placeholder="Write your comment"
                  type="text"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
