"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

const updateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  maxAllowedMemberships: z.number().min(1).max(5),
  publicMetadata: z.object({
    subscriptionPlan: z.enum(["free", "economic", "premium", "vip"]),
    subscriptionEndDate: z.string().nullable(),
    nif: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    country: z.string().length(2).optional(),
    currency: z.string().length(3).optional(),
    onboarding: z.boolean(),
  }),
  privateMetadata: z.object({
    hasHadFreeTrial: z.boolean(),
  }),
});

export async function updateOrganization(
  data: z.infer<typeof updateOrganizationSchema>
) {
  const validatedData = updateOrganizationSchema.parse(data);

  try {
    const updatedOrganization =
      await clerkClient.organizations.updateOrganization(
        validatedData.organizationId,
        {
          name: validatedData.name,
          slug: validatedData.slug,
          maxAllowedMemberships: validatedData.maxAllowedMemberships,
          publicMetadata: validatedData.publicMetadata,
          privateMetadata: validatedData.privateMetadata,
        }
      );

    return updatedOrganization;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw new Error("Failed to update organization");
  }
}
