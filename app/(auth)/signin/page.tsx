"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  return (
    <div className="w-full lg:min-h-[600px] xl:min-h-[800px] flex justify-center items-center">
      <Button
        size={"lg"}
        onClick={() => {
          signIn("github");
        }}
      >
        <Github className="h-6 w-6 mr-2" />
        Sign in
      </Button>
    </div>
  );
}
