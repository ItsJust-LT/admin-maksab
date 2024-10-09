import { DashboardOverview } from '@/components/dashboard-overview';
import { RecentActivity } from '@/components/recent-activity';
import { UserStats } from '@/components/user-stats';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardOverview />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserStats />
        <RecentActivity />
      </div>
    </div>
  );
}