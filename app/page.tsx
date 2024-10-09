import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  const user = currentUser();

  if (!user) {
    redirect("/sign-in");
  } else {
    redirect("/dashboard");
  }

  return null;
}
