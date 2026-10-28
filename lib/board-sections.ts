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
  Wallet,
  PenTool,
  BookOpenCheck,
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
    label: "قواعد نظام نرفد",
    href: "/board/business-rules",
    action: "استكشف قواعد النظام",
    icon: BookOpenCheck,
    description:
      "دليل تشغيلي بصري يشرح كيف يتخذ النظام قراراته، بلغة واضحة تناسب كل فريق نرفد.",
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
    label: "المالية",
    href: "/board/finance",
    action: "إدارة الماديات",
    icon: Wallet,
    description:
      "تحصيلات العملاء والمصروفات والاستحقاقات وصافي الحركة، مع تقارير قابلة للتصدير.",
  },
  {
    label: "مشروعات الهوية",
    href: "/board/identity-projects",
    action: "إدارة مشروعات الهوية",
    icon: PenTool,
    description:
      "طلبات الهوية البصرية وعروض أسعارها والتصميم والمراجعات والاعتمادات والتسليم والتحصيل.",
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
