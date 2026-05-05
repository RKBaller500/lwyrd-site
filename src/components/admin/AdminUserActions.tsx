"use client";

import { useTransition } from "react";
import { setAdminStatus, setAccessLevel, deleteUser } from "@/lib/actions/admin/users";

interface AdminUserActionsProps {
  userId: string;
  isAdmin: boolean;
  accessLevel: "none" | "subscription" | "org";
  name: string;
}

export default function AdminUserActions({
  userId,
  isAdmin,
  accessLevel,
  name,
}: AdminUserActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggleAdmin = () => {
    const action = isAdmin ? "Remove admin from" : "Make admin";
    if (!confirm(`${action} "${name}"?`)) return;
    startTransition(async () => {
      await setAdminStatus(userId, !isAdmin);
    });
  };

  const handleAccessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value as "none" | "subscription" | "org";
    startTransition(async () => {
      await setAccessLevel(userId, level);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Permanently delete "${name}"? This removes their account and cannot be undone.`)) return;
    startTransition(async () => {
      await deleteUser(userId);
    });
  };

  return (
    <div className="flex items-center gap-3 justify-end">
      <select
        value={accessLevel}
        onChange={handleAccessChange}
        disabled={isPending}
        className="text-xs border border-[#ddd7cc] rounded-xl px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:border-[#002452] transition-colors disabled:opacity-50 cursor-pointer"
      >
        <option value="none">No access</option>
        <option value="subscription">Subscription</option>
        <option value="org">Organization</option>
      </select>
      <button
        onClick={handleToggleAdmin}
        disabled={isPending}
        className="text-xs text-[#002452] hover:opacity-70 transition-opacity font-medium disabled:opacity-50"
      >
        {isAdmin ? "Remove Admin" : "Make Admin"}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
