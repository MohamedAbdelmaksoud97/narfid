import {
  FileText,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Palette,
  Search,
  UsersRound,
  UserRoundSearch,
  Package,
} from "lucide-react";

// One directory drives the sidebar, breadcrumbs and overview shortcuts.
export const boardSections = [
  {
    label: "نظرة عامة",
    href: "/board",
    action: "نظرة عامة",
    icon: LayoutDashboard,
    description: "مساحة نرفد الداخلية.",
  },
  {
    label: "المهام القادمة",
    href: "/board/tasks",
    action: "تابع خطة التنفيذ",
    icon: ListChecks,
    description:
      "خطة إطلاق نرفد وتطويرها، بمهام رئيسية وفرعية وتقدم محفوظ لكل خطوة.",
  },
  {
    label: "العملاء المحتملون",
    href: "/board/leads",
    action: "إدارة الفرص البيعية",
    icon: UserRoundSearch,
    description:
      "فرص البيع، جهات الاتصال، الباقات المرشحة والمتابعات حتى التعاقد.",
  },
  {
    label: "العملاء",
    href: "/board/clients",
    action: "إدارة العملاء",
    icon: UsersRound,
    description:
      "ملفات العملاء وعقودهم ودفعاتهم وتجهيزهم وتشغيلهم والدعم والتجديد.",
  },
  {
    label: "الباقات",
    href: "/board/plans",
    action: "إدارة الباقات",
    icon: Package,
    description:
      "المميزات والأسعار السنوية وإتاحة الباقات وربطها بملفات العملاء والعقود.",
  },
  {
    label: "التسويق",
    href: "/board/marketing",
    action: "افتح مساحة التسويق",
    icon: Megaphone,
    description:
      "الخطة التسويقية وأدلة المنصات الاجتماعية ومكتبة المنشورات ومتابعة نشرها.",
  },
  {
    label: "هوية نرفد",
    href: "/board/brand",
    action: "استكشف هوية نرفد",
    icon: Palette,
    description:
      "الرؤية والرسالة والعملاء وصوت البراند وشخصيته والمرجع البصري لفريقنا.",
  },
  {
    label: "المقالات",
    href: "/board/articles",
    action: "إدارة المقالات",
    icon: FileText,
    description:
      "كتابة المحتوى ومراجعة المسودات وبيانات البحث ونشر ما يساعد المؤسسات الرياضية.",
  },
  {
    label: "تحسين البحث",
    href: "/board/seo",
    action: "افتح دليل تحسين البحث",
    icon: Search,
    description:
      "دليل الإطلاق وخطة المقالات والقياس والخطوات الأسبوعية والشهرية لتطوير الظهور.",
  },
] as const;
