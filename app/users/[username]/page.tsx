import { getBlogBySlug } from "@/actions/blog-actions";

export default async function Page({
  params: { blogslug },
}: {
  params: { blogslug: string };
}) {
  const blog = await getBlogBySlug(blogslug);

  if (!blog) {
    return <div>Blog not found</div>;
  }

  if (blog.status !== 200) {
    return <div>Failed to load blog</div>;
  }

  return (
    <div>
      <h1>{blog.data.title}</h1>
      <p>{blog.data.content}</p>
    </div>
  );
}
