"use server";

import { clerkClient } from "@/lib/clerk";
import { revalidatePath } from "next/cache";

export type Subscription = "free" | "basic" | "premium";

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  membersCount: number;
  createdAt: string;
  imageUrl: string;
  subscription: Subscription;
  subscriptionEnd: string | null;
  email: string;
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
            (org.privateMetadata?.subscription as Subscription) || "Free",
          subscriptionEnd: org.privateMetadata?.subscriptionEnd as
            | string
            | null,
          email: (org.publicMetadata?.email as string) || "",
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
  slug: string,
  email: string
) {
  try {
    await clerkClient.organizations.updateOrganization(organizationId, {
      name,
      slug,
      publicMetadata: { email },
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
  createdBy: string,
  email: string,
  subscription: Subscription = "free"
) {
  try {
    await clerkClient.organizations.createOrganization({
      name,
      slug,
      createdBy,
      publicMetadata: { email },
      privateMetadata: {
        subscription,
        subscriptionEnd: null,
      },
    });
    revalidatePath("/organizations");
  } catch (error) {
    console.error("Error creating organization:", error);
    throw new Error("Failed to create organization");
  }
}

export async function updateSubscription(
  organizationId: string,
  subscription: Subscription,
  subscriptionEnd: string | null
) {
  try {
    // This is a dummy request. In a real-world scenario, you'd update the subscription with your payment provider
    await clerkClient.organizations.updateOrganization(organizationId, {
      privateMetadata: {
        subscription,
        subscriptionEnd,
      },
    });
    revalidatePath("/organizations");
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Failed to update subscription");
  }
}
