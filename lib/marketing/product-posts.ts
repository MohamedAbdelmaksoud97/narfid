import type { SocialPlatform, SocialPost } from "./social";
import { socialCaptions } from "./captions.ar";

export const productScreens = {
  overview: { file: "overview", label: "لوحة المتابعة" },
  members: { file: "members", label: "دليل الأعضاء" },
  subscriptions: { file: "subscriptions", label: "الاشتراكات" },
  attendance: { file: "attendance", label: "الحضور والدخول" },
  bookings: { file: "bookings", label: "الحجوزات والموارد" },
  staff: { file: "staff", label: "الموظفون والمدربون" },
  inventory: { file: "inventory", label: "مخزون المتجر" },
  branches: { file: "branches", label: "إعداد الفروع" },
  roles: { file: "roles", label: "مجموعات الصلاحيات" },
  restaurant: { file: "restaurant", label: "قائمة اليوم" },
  kitchen: { file: "kitchen", label: "المطبخ" },
  meals: { file: "meals", label: "كتالوج الوجبات" },
  finance: { file: "finance", label: "السجلات المالية" },
  services: { file: "services", label: "إعداد الخدمات" },
} as const;
type ProductTopic = {
  theme: string;
  screen: keyof typeof productScreens;
  scene: SocialPost["scene"];
  eyebrow: string;
  headlines: [string, string, string, string]; // Snapchat, Instagram, X, Facebook
  subline: string;
  points: [string, string, string];
  destination: string;
};

const topics: ProductTopic[] = [
  {
    theme: "member-file",
    screen: "members",
    scene: "reception",
    eyebrow: "ملف العضو",
    headlines: [
      "العضو وصل.\nوين ملفه؟",
      "تفاصيل العضو.\nبداية خدمة أوضح.",
      "ملف واحد.\nوسياق أوضح للفريق.",
      "تبدأ خدمة العضو\nمن معرفة تفاصيله.",
    ],
    subline: "ابحث عن العضو وراجع ملفه قبل الإجراء.",
    points: ["بحث عن العضو", "رقم العضوية", "حالة العضو"],
    destination: "/solutions/memberships",
  },
  {
    theme: "subscription-status",
    screen: "subscriptions",
    scene: "gym",
    eyebrow: "متابعة الاشتراكات",
    headlines: [
      "نشط ولا مجمّد؟\nراجع الحالة.",
      "كل اشتراك\nله حالة واضحة.",
      "قرار الاستقبال\nيبدأ بحالة الاشتراك.",
      "حين تعرف حالة الاشتراك،\nتتضح الخطوة التالية.",
    ],
    subline: "الباقة والفترة والحالة في قائمة يمكن مراجعتها.",
    points: ["اسم الباقة", "بداية ونهاية", "حالة الاشتراك"],
    destination: "/solutions/memberships",
  },
  {
    theme: "freeze-policy",
    screen: "subscriptions",
    scene: "gym",
    eyebrow: "تجميد الاشتراك",
    headlines: [
      "طلب تجميد؟\nابدأ بالسياسة.",
      "التجميد إجراء.\nوالسياسة أساسه.",
      "التجميد أوضح\nحين تُعرف ضوابطه.",
      "وحّد طريقة التعامل\nمع طلبات التجميد.",
    ],
    subline: "راجع شروط الاشتراك وصلاحية تنفيذ الإجراء.",
    points: ["سياسة الاشتراك", "فترة التجميد", "صلاحية الموظف"],
    destination: "/solutions/memberships",
  },
  {
    theme: "renewal-review",
    screen: "subscriptions",
    scene: "reception",
    eyebrow: "تجديد الاشتراكات",
    headlines: [
      "قرب ينتهي؟\nراجع التجديد.",
      "التجديد يبدأ\nقبل انتهاء العلاقة.",
      "قبل التجديد،\nراجع الفترة والباقة.",
      "لا تختزل تجديد العضوية\nفي تسجيل مبلغ.",
    ],
    subline: "فترة اشتراك وباقة وتحصيل يحتاج إلى متابعة.",
    points: ["راجع الاشتراك", "حدّد الباقة", "تابع التحصيل"],
    destination: "/solutions/memberships",
  },
  {
    theme: "attendance-review",
    screen: "attendance",
    scene: "reception",
    eyebrow: "الحضور والدخول",
    headlines: [
      "تسجّل الدخول؟\nراجع الزيارة.",
      "كل زيارة\nتستحق سجلًا واضحًا.",
      "راجع الحضور.\nوافهم قرار الدخول.",
      "متابعة الزيارات\nجزء من خدمة العضو.",
    ],
    subline: "العضو والوقت والطريقة وقرار الدخول.",
    points: ["سجل الزيارة", "وقت المحاولة", "قرار الدخول"],
    destination: "/solutions/memberships",
  },
  {
    theme: "booking-capacity",
    screen: "bookings",
    scene: "court",
    eyebrow: "سعة الحجوزات",
    headlines: [
      "فيه مكان؟\nراجع السعة أولًا.",
      "إتاحة الموعد\nليست وحدها كافية.",
      "الموعد والسعة.\nقرار حجز متكامل.",
      "قبل أن تؤكد الحجز،\nراجع المورد والسعة.",
    ],
    subline: "الحصة والملعب والتدريب لها احتياجات مختلفة.",
    points: ["المورد", "الموعد", "السعة"],
    destination: "/solutions/bookings",
  },
  {
    theme: "booking-followup",
    screen: "bookings",
    scene: "court",
    eyebrow: "متابعة الحجوزات",
    headlines: [
      "الحجز مؤكد؟\nخلّها واضحة.",
      "الحجز له موعد.\nوله حالة أيضًا.",
      "من الطلب للتأكيد.\nتابع حالة الحجز.",
      "نظّم متابعة الحجز\nبعد اختيار الموعد.",
    ],
    subline: "راجع حالة الحجز وما يرتبط به من تحصيل.",
    points: ["صاحب الحجز", "حالة الحجز", "القيمة"],
    destination: "/solutions/bookings",
  },
  {
    theme: "daily-menu",
    screen: "restaurant",
    scene: "kitchen",
    eyebrow: "قائمة اليوم",
    headlines: [
      "وش المتاح اليوم؟\nالقائمة تجاوب.",
      "قائمة اليوم.\nبداية تنسيق المطبخ.",
      "المتاح اليوم\nيحتاج قائمة واضحة.",
      "اربط قرار الاستقبال\nبما يجهزه المطبخ.",
    ],
    subline: "الوجبات والكميات المتاحة في يوم التشغيل.",
    points: ["اختيار الوجبات", "الكميات", "حالة القائمة"],
    destination: "/solutions/kitchen-inventory",
  },
  {
    theme: "kitchen-queue",
    screen: "kitchen",
    scene: "kitchen",
    eyebrow: "طابور المطبخ",
    headlines: [
      "قيد التحضير؟\nولا جاهز؟",
      "الطلب يتحرك.\nوالحالة توضّح.",
      "من التحضير للجاهزية.\nتابع حالة الطلب.",
      "اجعل متابعة الطلب\nأسهل بين أقسامك.",
    ],
    subline: "حالات الطلب تساعد الفريق على التنسيق.",
    points: ["طلب جديد", "قيد التحضير", "جاهز للتسليم"],
    destination: "/solutions/kitchen-inventory",
  },
  {
    theme: "meal-catalog",
    screen: "meals",
    scene: "kitchen",
    eyebrow: "كتالوج الوجبات",
    headlines: [
      "عرّف الوجبة.\nقبل قائمة اليوم.",
      "كتالوج منظّم.\nوقائمة أسهل.",
      "ابدأ بتعريف الوجبة.\nثم نظّم إتاحتها.",
      "تفاصيل الوجبة\nتبدأ من مصدر واحد.",
    ],
    subline: "أسماء الوجبات وتصنيفاتها وبياناتها.",
    points: ["تعريف الوجبة", "تصنيفها", "حالتها"],
    destination: "/solutions/kitchen-inventory",
  },
  {
    theme: "stock-available",
    screen: "inventory",
    scene: "inventory",
    eyebrow: "المتاح للبيع",
    headlines: [
      "موجود في الرف؟\nراجع المتاح للبيع.",
      "رصيد فعلي.\nومتاح للبيع.",
      "المحجوز والمتاح.\nتفاصيل تصنع فرقًا.",
      "قبل وعد العميل بالمنتج،\nراجع رصيد الفرع.",
    ],
    subline: "تابع الرصيد الفعلي والمحجوز والمتاح.",
    points: ["رصيد فعلي", "محجوز", "متاح للبيع"],
    destination: "/solutions/kitchen-inventory",
  },
  {
    theme: "reorder-level",
    screen: "inventory",
    scene: "inventory",
    eyebrow: "حد إعادة الطلب",
    headlines: [
      "قرب يخلص؟\nراجع الحد.",
      "حد واضح.\nومراجعة للمخزون.",
      "تابع الحد.\nقبل نفاد المنتج.",
      "اجعل نقص المنتجات\nجزءًا من المراجعة.",
    ],
    subline: "قارن الرصيد بحد إعادة الطلب لكل منتج.",
    points: ["رصيد المنتج", "حد إعادة الطلب", "حالة المخزون"],
    destination: "/solutions/kitchen-inventory",
  },
  {
    theme: "invoice-collection",
    screen: "finance",
    scene: "workspace",
    eyebrow: "الفواتير والتحصيل",
    headlines: [
      "فاتورة موجودة.\nوالتحصيل؟",
      "افصل السؤالين:\nكم بِيع؟ وكم حُصّل؟",
      "فاتورة وتحصيل.\nراجعهما معًا.",
      "البيع لا يجيب وحده\nعن سؤال التحصيل.",
    ],
    subline: "رقم الفاتورة والإجمالي والمدفوع في السجل.",
    points: ["الفاتورة", "الإجمالي", "المدفوع"],
    destination: "/solutions/point-of-sale",
  },
  {
    theme: "financial-review",
    screen: "finance",
    scene: "workspace",
    eyebrow: "مراجعة الحركة المالية",
    headlines: [
      "وراء الرقم\nفيه عملية.",
      "ابدأ من الرقم.\nوارجع إلى العملية.",
      "مراجعة أوضح\nبسجلات مرتبطة.",
      "عند اختلاف الأرقام،\nابدأ بالسجل.",
    ],
    subline: "راجع الفاتورة والمدفوعات بحسب الصلاحية.",
    points: ["ابحث في السجل", "راجع التفاصيل", "حدّد الإجراء"],
    destination: "/solutions/point-of-sale",
  },
  {
    theme: "branch-context",
    screen: "branches",
    scene: "workspace",
    eyebrow: "إدارة الفروع",
    headlines: [
      "أي فرع تقصد؟\nحدّد النطاق.",
      "فرع واضح.\nوسياق عمل واضح.",
      "قبل قراءة البيانات،\nراجع الفرع.",
      "كل فرع له تشغيله.\nوالإدارة تجمع الصورة.",
    ],
    subline: "تعريف الفروع ونطاق العمل جزء من الإعداد.",
    points: ["تعريف الفرع", "حالة الفرع", "نطاق العمل"],
    destination: "/solutions/branches",
  },
  {
    theme: "permission-scope",
    screen: "roles",
    scene: "workspace",
    eyebrow: "الصلاحيات والأدوار",
    headlines: [
      "ما الذي يراه؟\nوما الذي ينفّذه؟",
      "الدور المناسب.\nوالوصول المناسب.",
      "الصلاحية تبدأ\nمن مسؤولية الموظف.",
      "وسّع الوصول\nبحسب احتياج العمل.",
    ],
    subline: "مجموعات صلاحيات تُمنح بحسب المسؤولية.",
    points: ["حدّد المسؤولية", "راجع الصلاحية", "اضبط الوصول"],
    destination: "/solutions/branches",
  },
  {
    theme: "team-records",
    screen: "staff",
    scene: "gym",
    eyebrow: "الموظفون والمدربون",
    headlines: [
      "مين في الفريق؟\nومسؤوليته إيه؟",
      "تنظيم الفريق\nيبدأ ببيانات واضحة.",
      "الموظف والفرع.\nوسياق مسؤولية أوضح.",
      "اجمع بيانات الفريق\nقبل توزيع العمل.",
    ],
    subline: "الموظف والمسمى والفرع في مساحة متابعة.",
    points: ["بيانات الموظف", "المسمى الوظيفي", "الفرع والحالة"],
    destination: "/solutions/branches",
  },
  {
    theme: "daily-overview",
    screen: "overview",
    scene: "workspace",
    eyebrow: "نظرة الإدارة",
    headlines: [
      "تبدأ يومك\nمن أي شاشة؟",
      "صورة أولى لليوم.\nثم مراجعة التفاصيل.",
      "نظرة للفرع.\nوبداية متابعة أوضح.",
      "ابدأ يوم الإدارة\nبصورة عن التشغيل.",
    ],
    subline: "مؤشرات تشغيل تساعد على تحديد ما يحتاج مراجعة.",
    points: ["الاشتراكات", "الحضور", "الحركة المالية"],
    destination: "/contact",
  },
  {
    theme: "service-catalog",
    screen: "services",
    scene: "gym",
    eyebrow: "تعريف الخدمات",
    headlines: [
      "لياقة ولا جلسة؟\nعرّف خدمتك.",
      "خدمات مختلفة.\nوإعداد يناسبها.",
      "نوع الخدمة\nبداية الإعداد الصحيح.",
      "ابدأ من خدماتك الفعلية\nقبل اختيار الإعداد.",
    ],
    subline: "دخول مرفق أو جلسة أو خطة وجبات.",
    points: ["اسم الخدمة", "نوع التنفيذ", "حالة الخدمة"],
    destination: "/contact",
  },
  {
    theme: "guided-demo",
    screen: "overview",
    scene: "reception",
    eyebrow: "تجربة تناسب مؤسستك",
    headlines: [
      "اختار دورة عمل.\nونشوفها معًا.",
      "شاهد ما يهمك.\nفي عرض يناسبك.",
      "أفضل بداية للعرض؟\nسؤال من تشغيلك.",
      "اطلب عرضًا يبدأ\nمن احتياج فريقك.",
    ],
    subline: "نوع النشاط والفروع وأهم احتياج: بداية النقاش.",
    points: ["صف نشاطك", "حدّد فروعك", "اختر احتياجك"],
    destination: "/contact",
  },
];

export function createProductPosts(platform: SocialPlatform): SocialPost[] {
  const position = { snapchat: 0, instagram: 1, x: 2, facebook: 3 }[
    platform.id
  ];
  return topics.map((topic, index) => {
    const headline = topic.headlines[position];
    const caption = socialCaptions[platform.id][index + 10];
    return {
      id: String(index + 11).padStart(2, "0"),
      platform: platform.id,
      theme: topic.theme,
      scene: topic.scene,
      screenshot: topic.screen,
      imageStyle: index % 3 === 0 ? "wide" : "focus",
      eyebrow: topic.eyebrow,
      headline,
      subline: topic.subline,
      points: topic.points,
      caption,
      alt: `${headline.replaceAll("\n", " ")} — ${topic.subline} ${topic.points.join("، ")}. لقطة فعلية من واجهة ${productScreens[topic.screen].label}، بهوية نرفد وبيانات عرض تجريبية؛ ليست بيانات عميل أو نتائج أداء.`,
      cta: index === 19 ? "اختر ما تريد مشاهدته" : "احجز عرضًا توضيحيًا",
      goal: index === 19 ? "طلب عرض" : index % 4 === 0 ? "تقييم" : "تعليم",
      audience:
        index >= 14 && index <= 17
          ? "مالك المؤسسة ومدير العمليات أو الفرع"
          : "مسؤول التشغيل والفريق المعني بدورة العمل",
      destination: topic.destination,
      layout: "product",
    };
  });
}
