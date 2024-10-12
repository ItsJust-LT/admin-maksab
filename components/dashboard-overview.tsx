import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./stat-card";
import { SupabaseClient } from "@/lib/supabase/client";
import { InfoChart } from "./info-chart";

export async function DashboardOverview() {
  const supabase = SupabaseClient();

  // Get the total count of users
  const { error: UserError, count: UserCount } = await supabase
    .from("users")
    .select("id", { count: 'exact' });

  // Get the total count of users created in the last 30 days
  const { error: RecentUserError, count: RecentUserCount } = await supabase
    .from("users")
    .select("id", { count: 'exact' })
    .gt("created_at", new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

  // Get the total count of organizations
  const { error: OrganizationError, count: OrganizationCount } = await supabase
    .from("organizations")
    .select("id", { count: 'exact' });

  // Get the total count of organizations created in the last 30 days
  const { error: RecentOrganizationError, count: RecentOrganizationCount } = await supabase
    .from("organizations")
    .select("id", { count: 'exact' })
    .gt("created_at", new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

  // Calculate change in users and organizations
  const userChange = RecentUserCount ? `+${RecentUserCount}` : "0";
  const organizationChange = RecentOrganizationCount ? `+${RecentOrganizationCount}` : "0";

  // Get the current month start and end dates
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  // Fetch all users created in the current month
  const { data: usersThisMonth, error: usersMonthError } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", startOfMonth.toISOString())
    .lte("created_at", endOfMonth.toISOString());

  if (usersMonthError) {
    console.error("Error fetching users for this month:", usersMonthError);
    return <p>Error loading users overview</p>;
  }


  // Initialize data for each day of the current month
  const usersData = Array.from({ length: endOfMonth.getDate() }, (_, i) => {
    const date = new Date(startOfMonth);
    date.setDate(i + 1);
    return { date, users: 0 }; // Initialize count to 0
  });

  // Count users for each day
  usersThisMonth.forEach(user => {
    const userDate = new Date(user.created_at);
    const dayIndex = userDate.getUTCDate() - 1; // Get the index for the day
    if (dayIndex >= 0 && dayIndex < usersData.length) {
      usersData[dayIndex].users += 1; // Increment the user count for that day
    }
  });


  const latestValue = usersData[usersData.length - 1].users; // Get the user count for the last day
  const previousValue = usersData[usersData.length - 2]?.users || 0; // Get the user count for the day before
  const valueChange = latestValue - previousValue;
  const valueChangePercentage = previousValue > 0 ? ((valueChange / previousValue) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={UserCount?.toString() || "0"}
          change={userChange}
          icon="users"
        />
        <StatCard
          title="Organizations"
          value={OrganizationCount?.toString() || "0"}
          change={organizationChange}
          icon="building2"
        />

      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Users Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoChart
            title="Total Users This Month"
            iconName="users"
            dataKey="users"
            color="hsl(142, 76%, 36%)"
            data={usersData}
            formatType="number"
            latestValue={UserCount || 0}
            previousValue={0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
