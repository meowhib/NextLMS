import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log("🔐 Session:", session);

  if (session) {
    redirect("/dashboard");
  }

  return <div>{children}</div>;
}
