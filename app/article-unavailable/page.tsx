import { notFound } from "next/navigation";
export const metadata = {
  title: "المقال غير متاح | نرفد",
  robots: { index: false, follow: false },
};
// Throw synchronously before a suspense boundary can start a 200 response stream.
export default function Page() {
  notFound();
}
