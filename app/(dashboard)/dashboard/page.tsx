import { DashboardOverview } from '@/components/dashboard-overview';
import { RecentActivity } from '@/components/recent-activity';
import { UserStats } from '@/components/user-stats';
import { SupabaseClient } from '@/lib/supabase/client';

export default async function DashboardPage() {
  const supabase = SupabaseClient();

  // Get the current date and calculate dates for 30 days and 7 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString();
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();

  // Get the total count of users created in the last 30 days (new users)
  const { error: newUserError, count: newUsersCount } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .gt('created_at', thirtyDaysAgo);

  // Get the count of active users (last_online in the last 7 days)
  const { error: activeUserError, count: activeUsersCount } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .gt('last_online', sevenDaysAgo);

  // Get the total count of inactive users (last_online not in the last 7 days)
  const { error: inactiveUserError, count: inactiveUsersCount } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .lte('last_online', sevenDaysAgo); // Users last online more than 7 days ago

  if (newUserError || activeUserError || inactiveUserError) {
    console.error('Error fetching user data', { newUserError, activeUserError, inactiveUserError });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardOverview />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


      </div>
    </div>
  );
}