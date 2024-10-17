import { SignIn } from "@clerk/nextjs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center ">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold ">Welcome Back</h1>
          <p className="mt-2">Sign in to access your account</p>
        </div>
        <div className="overflow-hidden rounded-lg ">
          <div className="p-6">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/90 text-white",
                  footerActionLink: "text-primary hover:text-primary/90",
                },
              }}
              fallbackRedirectUrl={'/dashboard'}
            />
          </div>
        </div>
        <div className="mt-8 text-center">

        </div>
      </div>
    </div>
  )
}