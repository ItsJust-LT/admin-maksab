import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {

  redirect("/sign-in");



  return null;
}
