"use server";

import { clerkClient } from "@/lib/clerk";
import { revalidatePath } from "next/cache";

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  membersCount: number;
  createdAt: string;
  imageUrl: string;
  subscription: "free" | "basic" | "premium";
};

export type OrganizationListParams = {
  limit?: number;
  offset?: number;
  query?: string;
};

export async function getOrganizations({
  limit = 10,
  offset = 0,
  query = "",
}: OrganizationListParams) {
  try {
    const { data: organizations, totalCount } =
      await clerkClient.organizations.getOrganizationList({
        limit,
        offset,
        query,
        includeMembersCount: true,
        orderBy: "-created_at",
      });

    return {
      organizations: organizations.map(
        (org): Organization => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          membersCount: org.membersCount || 0,
          createdAt: new Date(org.createdAt).toISOString(),
          imageUrl: org.imageUrl,
          subscription:
            (org.privateMetadata
              ?.subscription as Organization["subscription"]) || "free",
        })
      ),
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw new Error("Failed to fetch organizations");
  }
}

export async function updateOrganization(
  organizationId: string,
  name: string,
  slug: string
) {
  try {
    await clerkClient.organizations.updateOrganization(organizationId, {
      name,
      slug,
    });
    revalidatePath("/organizations");
  } catch (error) {
    console.error("Error updating organization:", error);
    throw new Error("Failed to update organization");
  }
}

export async function deleteOrganization(organizationId: string) {
  try {
    await clerkClient.organizations.deleteOrganization(organizationId);
    revalidatePath("/organizations");
  } catch (error) {
    console.error("Error deleting organization:", error);
    throw new Error("Failed to delete organization");
  }
}

export async function createOrganization(
  name: string,
  slug: string,
  createdBy: string
) {
  try {
    await clerkClient.organizations.createOrganization({
      name,
      slug,
      createdBy,
    });
    revalidatePath("/organizations");
  } catch (error) {
    console.error("Error creating organization:", error);
    throw new Error("Failed to create organization");
  }
}
