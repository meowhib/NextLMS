"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "./ui/textarea";
import createComment from "@/actions/comments-action";

export const commentFormSchema = z.object({
  comment: z.string().min(1).max(1000),
});

export default function CommentForm() {
  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      comment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof commentFormSchema>) {
    const { status, data } = await createComment({ comment: values.comment });

    if (status !== 200 || !data) {
      alert("Could not create comment");
      return;
    }

    alert("Comment created: " + data.content);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Write your thoughts" {...field} />
              </FormControl>
              <FormDescription>
                This will be public, everyone will be able to see it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
