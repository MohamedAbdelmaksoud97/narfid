import type { Metadata } from "next";
import { CrmList } from "@/components/board/crm/crm-list";
export const metadata: Metadata = {
  title: "العملاء المحتملون | إدارة نرفد",
  robots: { index: false, follow: false },
};
export default function LeadsPage() {
  return <CrmList key="lead" kind="lead" />;
}
