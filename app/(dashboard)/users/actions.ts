"use server";

import { clerkClient } from "@/lib/clerk";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: { emailAddress: string }[];
  createdAt: string; // Use string
  lastSignInAt: string | null; // Use string
};

export type UserListParams = {
  limit?: number;
  offset?: number;
  query?: string;
};

export async function getUsers({
  limit = 500,
  offset = 0,
  query = "",
}: UserListParams) {
  try {
    const { data: users, totalCount } = await clerkClient.users.getUserList({
      limit,
      offset,
      query,
    });

    return {
      users: users.map(
        (user): User => ({
          id: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          emailAddresses: user.emailAddresses,
          createdAt: new Date(user.createdAt).toISOString(), // Convert to ISO string
          lastSignInAt: user.lastSignInAt
            ? new Date(user.lastSignInAt).toISOString()
            : null, // Handle null explicitly
        })
      ),
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function addUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  try {
    await clerkClient.users.createUser({
      firstName,
      lastName,
      emailAddress: [email],
      password,
      skipPasswordChecks: true,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    throw new Error("Failed to add user");
  }
}

export async function updateUser(
  userId: string,
  firstName: string,
  lastName: string
) {
  try {
    await clerkClient.users.updateUser(userId, {
      firstName,
      lastName,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(userId: string) {
  try {
    await clerkClient.users.deleteUser(userId);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function deleteUsers(userIds: string[]) {
  try {
    await Promise.all(userIds.map((id) => clerkClient.users.deleteUser(id)));
  } catch (error) {
    console.error("Error deleting users:", error);
    throw new Error("Failed to delete users");
  }
}
