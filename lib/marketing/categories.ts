// Editorial pillars, shared by the library and downloadable copy.
export const socialCategories = [
  {
    id: "member-app",
    name: "تطبيق الأعضاء",
    description:
      "تطبيق بهوية المؤسسة للاشتراكات والتجديد والحجز والملاحظات والتنبيهات، ضمن اتفاق تطوير مخصص.",
  },
  {
    id: "access",
    name: "بوابات الدخول",
    description:
      "تقييم توافق الأجهزة وسياسات الدخول وسجلات المحاولات وخطة اختبار التكامل مع النظام.",
  },
  {
    id: "brand",
    name: "نرفد والشراكة",
    description:
      "من نحن، نطاق الخدمة السنوي، والاحتياجات التقنية الخاصة التي تبدأ بتقييم واتفاق.",
  },
  {
    id: "members",
    name: "الأعضاء والاشتراكات",
    description:
      "تجربة الاستقبال، ملف العضو، التجديد والتجميد والحضور؛ محتوى يساعد الفريق في خدمة العضو.",
  },
  {
    id: "bookings",
    name: "الحجوزات والتدريب",
    description:
      "الملاعب والأكاديميات والحصص والتدريب الشخصي: الإتاحة والسعة والسياسات قبل التأكيد.",
  },
  {
    id: "finance",
    name: "المالية ونقاط البيع",
    description:
      "البيع والتحصيل والمرتجعات وإقفال الورديات؛ أسئلة عملية للمسؤول المالي والتشغيل.",
  },
  {
    id: "food-stock",
    name: "المطبخ والمخزون",
    description:
      "قائمة اليوم وتحضير الوجبات واستحقاقها، ومراجعة مخزون المنتجات في كل فرع.",
  },
  {
    id: "team",
    name: "الفروع والفريق",
    description:
      "أدوار واضحة وصلاحيات مناسبة وتدريب وتسليم عمل يدعم إدارة أكثر من فرع.",
  },
  {
    id: "growth",
    name: "التشغيل والنمو",
    description:
      "أدلة وأسئلة شراء ومراجعات تشغيل واستعداد للمواسم والتوسع، من واقع المؤسسة الرياضية.",
  },
] as const;
export type SocialCategoryId = (typeof socialCategories)[number]["id"];

// IDs 01–30 are stable: changing a category never creates a new publication.
const existing: SocialCategoryId[] = [
  "brand",
  "members",
  "bookings",
  "finance",
  "food-stock",
  "food-stock",
  "team",
  "growth",
  "brand",
  "brand",
  "members",
  "members",
  "members",
  "members",
  "members",
  "bookings",
  "bookings",
  "food-stock",
  "food-stock",
  "food-stock",
  "food-stock",
  "food-stock",
  "finance",
  "finance",
  "team",
  "team",
  "team",
  "growth",
  "growth",
  "brand",
];
export function existingPostCategory(index: number): SocialCategoryId {
  const category = existing[index];
  if (!category) throw new Error(`Missing category for post ${index + 1}`);
  return category;
}
