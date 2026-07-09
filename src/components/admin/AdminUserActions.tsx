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
    <div className="adm-row-actions" style={{ gap: 10 }}>
      <select
        value={accessLevel}
        onChange={handleAccessChange}
        disabled={isPending}
        className="adm-select is-inline"
      >
        <option value="none">No access</option>
        <option value="subscription">Subscription</option>
        <option value="org">Organization</option>
      </select>
      <button onClick={handleToggleAdmin} disabled={isPending} className="adm-link">
        {isAdmin ? "Remove Admin" : "Make Admin"}
      </button>
      <button onClick={handleDelete} disabled={isPending} className="adm-del">
        Delete
      </button>
    </div>
  );
}
