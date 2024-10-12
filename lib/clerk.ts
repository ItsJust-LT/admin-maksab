import { createClerkClient } from "@clerk/backend";

export const clerkClient = createClerkClient({
  secretKey: process.env.NEXT_PRIVATE_CLERK_SECRET_KEY,
});
