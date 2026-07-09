import type { ReactNode } from "react";

/**
 * Shared admin page header: small eyebrow, serif title, optional subtitle,
 * and a slot for actions (buttons) on the right.
 */
export default function AdminHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="adm-header">
      <div>
        {eyebrow ? <span className="adm-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="adm-header-actions">{actions}</div> : null}
    </div>
  );
}
