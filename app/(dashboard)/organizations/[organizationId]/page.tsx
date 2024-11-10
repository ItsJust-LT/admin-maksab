import { notFound } from "next/navigation"
import OrganizationView from "./organizationView"
import { clerkClient } from "@/lib/clerk"

export default async function OrganizationPage({ params }: { params: { organizationId: string } }) {
    let organization
    try {
        const org = await clerkClient.organizations.getOrganization({
            organizationId: params.organizationId,
        })

        if (!org) {
            notFound()
        }

        // Extract only the necessary, serializable data
        organization = {
            id: org.id,
            name: org.name ?? null,
            slug: org.slug,
            maxAllowedMemberships: org.maxAllowedMemberships ?? null,
            publicMetadata: org.publicMetadata ?? {},
            privateMetadata: org.privateMetadata ?? {},
        }
    } catch (error) {
        console.error("Error fetching organization:", error)
        notFound()
    }

    return <OrganizationView organization={organization} />
}