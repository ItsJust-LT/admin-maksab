import {
  getOrganizations,
  updateSubscription,
} from "@/app/(dashboard)/organizations/actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const limit = 100; // Define the batch size (100 organizations per page)
    let offset = 0;
    let totalOrganizationsScanned = 0;
    let hasMore = true;
    const currentDate = new Date();

    console.log(`Starting subscription check at ${currentDate.toISOString()}`);

    // Paginate through all organizations
    while (hasMore) {
      // Fetch organizations for the current page
      const { organizations, totalCount } = await getOrganizations({
        limit,
        offset,
      });

      // Log progress of scanning organizations
      console.log(
        `Scanned ${organizations.length} organizations in this batch. Offset: ${offset}`
      );

      // Loop through each organization and check if the subscription end date has passed
      for (const org of organizations) {
        try {
          if (
            org.subscriptionEnd &&
            new Date(org.subscriptionEnd) < currentDate
          ) {
            // Update the organization to "Free" subscription if the subscription has ended
            await updateSubscription(org.id, "Free", null);
            console.log(
              `Updated subscription to Free for organization: ${org.name} (ID: ${org.id})`
            );
          }
        } catch (orgError) {
          console.error(
            `Failed to update organization: ${org.name} (ID: ${org.id})`,
            orgError
          );
          // Continue with the next organization even if there's an error
        }
      }

      // Update the total count of scanned organizations
      totalOrganizationsScanned += organizations.length;

      // Check if there are more organizations to fetch
      offset += limit;
      hasMore = totalOrganizationsScanned < totalCount;

      console.log(
        `Total organizations scanned so far: ${totalOrganizationsScanned} / ${totalCount}`
      );
    }

    // Final log when the scan completes
    console.log(
      `Subscription check completed successfully at ${new Date().toISOString()}. Total organizations scanned: ${totalOrganizationsScanned}`
    );

    return new Response("Subscription check completed successfully.", {
      status: 200,
    });
  } catch (error) {
    console.error("Error in subscription check:", error);
    return new Response("Failed to check subscriptions.", { status: 500 });
  }
}
