import type { Metadata } from "next";
import { CrmPlans } from "@/components/board/crm/crm-plans";
export const metadata: Metadata = {
  title: "الباقات | إدارة نرفد",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CrmPlans />;
}
