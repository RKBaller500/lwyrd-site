import { getAllUsers } from "@/lib/actions/admin/users";
import UsersTable from "@/components/admin/UsersTable";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = { title: "Users, Admin" };

export default async function AdminUsersPage() {
  const { data: users, error } = await getAllUsers();

  return (
    <div>
      <AdminHeader
        eyebrow="Activity"
        title="Users"
        subtitle={`${users?.length ?? 0} registered user${(users?.length ?? 0) !== 1 ? "s" : ""}.`}
      />

      {error && <div className="adm-error" style={{ marginBottom: 20 }}>{error}</div>}

      <UsersTable users={users ?? []} />
    </div>
  );
}
