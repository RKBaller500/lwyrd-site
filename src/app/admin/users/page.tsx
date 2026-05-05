import { getAllUsers } from "@/lib/actions/admin/users";
import UsersTable from "@/components/admin/UsersTable";

export const metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const { data: users, error } = await getAllUsers();

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-4xl text-[#002452] mb-1"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          Users
        </h1>
        <p className="text-slate-500 text-sm">{users?.length ?? 0} registered users</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm mb-6">
          {error}
        </div>
      )}

      <UsersTable users={users ?? []} />
    </div>
  );
}
