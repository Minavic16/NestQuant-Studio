import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Dashboard shell. Every page in this route group requires a session, checked
 * here as well as in the proxy and in each API route, so a mistake in one layer
 * cannot expose the back office (ARCHITECTURE.md §10).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
