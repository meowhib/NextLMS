import { signIn } from "@/auth";

export default function LoginForm() {
  return (
    <div className="w-full lg:min-h-[600px] xl:min-h-[800px] flex justify-center items-center">
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button type="submit">Signin with GitHub</button>
      </form>
    </div>
  );
}
