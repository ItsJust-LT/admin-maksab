import { OrganizationList } from '@/components/organization-list';

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organizations</h1>
      <OrganizationList />
    </div>
  );
}