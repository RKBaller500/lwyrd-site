import { redirect } from "next/navigation";

// All category-specific intake URLs now redirect to the universal intake flow.
export default function LegacyIntakePage() {
  redirect("/intake");
}
