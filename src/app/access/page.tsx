import { redirect } from "next/navigation";

// Checkout is disabled while everything is free. This route is kept so old links
// and bookmarks resolve cleanly; it forwards to the dashboard. Re-introduce the
// paywall UI here when Stripe is re-enabled.
export default function AccessPage() {
  redirect("/dashboard");
}
