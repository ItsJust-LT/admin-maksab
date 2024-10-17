import { OrganizationsList } from '@/components/organization-list';
import { getOrganizations } from './actions';

export default async function OrganizationsPage() {
  const { organizations, totalCount } = await getOrganizations({ limit: 10, offset: 0 });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organizations</h1>
      <OrganizationsList initialOrganizations={organizations} initialTotalCount={totalCount} />
    </div>
  );
}