import { UserList } from '@/components/user-list';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>
      <UserList />
    </div>
  );
}