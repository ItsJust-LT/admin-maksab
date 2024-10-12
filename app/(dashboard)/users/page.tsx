import { UserList } from '@/components/user-list';
import { getUsers } from './actions';

export default async function UsersPage() {
  const { users: UserData, totalCount } = await getUsers({ limit: 10, offset: 0 })

  const users = JSON.parse(JSON.stringify(UserData));

  return (

    <UserList initialUsers={users} initialTotalCount={totalCount} />

  );
}