"use server";

import { clerkClient } from "@/lib/clerk";
import { revalidatePath } from "next/cache";

export type Subscription = "free" | "economic" | "premium" | "vip";

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  membersCount: number;
  createdAt: string;
  imageUrl: string;
  subscription: {
    plan: Subscription;
    endDate: string | null;
    freeTrial: boolean;
  };
  hasHadFreeTrial: boolean;
  nif: string;
  email: string;
  address: string;
  country: string;
  currency: string;
  onboarding: boolean;
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
          subscription: {
            plan:
              (org.privateMetadata?.subscription as { plan?: Subscription })
                ?.plan || "free",
            endDate:
              (org.privateMetadata?.subscription as { endDate?: string | null })
                ?.endDate || null,
            freeTrial:
              (org.privateMetadata?.subscription as { freeTrial?: boolean })
                ?.freeTrial || false,
          },
          hasHadFreeTrial:
            (org.privateMetadata?.hasHadFreeTrial as boolean) || false,
          nif: (org.publicMetadata?.nif as string) || "",
          email: (org.publicMetadata?.email as string) || "",
          address: (org.publicMetadata?.address as string) || "",
          country: (org.publicMetadata?.country as string) || "",
          currency: (org.publicMetadata?.currency as string) || "",
          onboarding: (org.publicMetadata?.onboarding as boolean) || false,
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
  email: string,
  nif: string,
  address: string,
  country: string,
  currency: string,
  onboarding: boolean
) {
  try {
    await clerkClient.organizations.updateOrganization(organizationId, {
      name,
      slug,
      publicMetadata: { email, nif, address, country, currency, onboarding },
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
  nif: string,
  address: string,
  country: string,
  currency: string,
  subscription: Subscription = "free"
) {
  try {
    await clerkClient.organizations.createOrganization({
      name,
      slug,
      createdBy,
      publicMetadata: {
        email,
        nif,
        address,
        country,
        currency,
        onboarding: false,
      },
      privateMetadata: {
        subscription: {
          plan: subscription,
          endDate: null,
          freeTrial: false,
        },
        hasHadFreeTrial: false,
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
  plan: Subscription,
  endDate: string | null,
  freeTrial: boolean
) {
  try {
    const org = await clerkClient.organizations.getOrganization({
      organizationId,
    });
    const currentPrivateMetadata = org.privateMetadata || {};

    await clerkClient.organizations.updateOrganization(organizationId, {
      privateMetadata: {
        ...currentPrivateMetadata,
        subscription: {
          plan,
          endDate,
          freeTrial,
        },
        hasHadFreeTrial: currentPrivateMetadata.hasHadFreeTrial || freeTrial,
      },
    });
    revalidatePath("/organizations");
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Failed to update subscription");
  }
}

export async function updateOnboardingStatus(
  organizationId: string,
  onboarding: boolean
) {
  try {
    await clerkClient.organizations.updateOrganization(organizationId, {
      publicMetadata: { onboarding },
    });
    revalidatePath("/organizations");
  } catch (error) {
    console.error("Error updating onboarding status:", error);
    throw new Error("Failed to update onboarding status");
  }
}
