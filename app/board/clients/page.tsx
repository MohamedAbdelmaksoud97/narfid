import type { Metadata } from "next";
import { CrmList } from "@/components/board/crm/crm-list";
export const metadata: Metadata = {
  title: "العملاء | إدارة نرفد",
  robots: { index: false, follow: false },
};
export default function ClientsPage() {
  return <CrmList key="client" kind="client" />;
}
