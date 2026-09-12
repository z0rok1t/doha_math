import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdmin } from "@/lib/admin/guard";

export const metadata: Metadata = {
  // The panel must never be indexed. It is also absent from any sitemap.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Display only. Access is enforced by requireAdmin() in each page and action.
  const admin = await getAdmin();

  return (
    <>
      <AdminNav email={admin?.email} login={admin?.login} />
      <main className="flex-1">{children}</main>
    </>
  );
}
