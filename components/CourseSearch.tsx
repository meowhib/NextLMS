"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useDebounce } from "@/hooks/use-debounce";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

type FormValues = {
  search: string;
};

export default function CourseSearch() {
  const [results, setResults] = useState<Course[]>([]);
  const form = useForm<FormValues>({
    defaultValues: {
      search: "",
    },
  });

  const debouncedSearch = useDebounce(async (value: string) => {
    if (value.trim() === "") {
      setResults([]);
      return;
    }

    const response = await fetch(
      `/api/courses/search?q=${encodeURIComponent(value)}`
    );
    const data = await response.json();
    setResults(data.courses);
  }, 300);

  const onSubmit = useCallback(
    (values: FormValues) => {
      debouncedSearch(values.search);
    },
    [debouncedSearch]
  );

  return (
    <div className="relative">
      <Form {...form}>
        <form onChange={form.handleSubmit(onSubmit)} className="relative">
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search courses..."
                      className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="sr-only">
            Search
          </Button>
        </form>
      </Form>
      {results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg">
          {results.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="block px-4 py-2 hover:bg-muted"
            >
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                {course.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
