import type { SocialPlatform, SocialPost } from "./social";
import { socialCaptions } from "./captions.ar";
import { productScreens } from "./product-posts";

type Topic = {
  theme: string;
  category: SocialPost["category"];
  screen: keyof typeof productScreens;
  scene: SocialPost["scene"];
  title: string;
  headlines: [string, string, string, string];
  subline: string;
  points: [string, string, string];
  destination: string;
};

const topics: Topic[] = [
  {
    theme: "first-visit",
    category: "members",
    screen: "members",
    scene: "reception",
    title: "أول زيارة",
    headlines: [
      "أول زيارة؟\nخلّ البداية واضحة.",
      "تجربة العضو تبدأ\nعند الاستقبال.",
      "بداية العضوية\nتحتاج مسارًا مفهومًا.",
      "رحّب بالعضو الجديد.\nثم وضّح رحلته.",
    ],
    subline: "الملف والباقة وطريقة الاستفادة من الخدمة.",
    points: ["راجع البيانات", "اشرح الباقة", "وضّح الخطوة التالية"],
    destination: "/solutions/memberships",
  },
  {
    theme: "package-fit",
    category: "members",
    screen: "services",
    scene: "gym",
    title: "اختيار الباقة",
    headlines: [
      "الباقة المناسبة؟\nابدأ من الخدمة.",
      "قبل سعر الباقة،\nوضّح ما تتضمنه.",
      "الباقة الواضحة\nتبدأ بوصف الخدمة.",
      "اجعل مقارنة الباقات\nأسهل لفريقك وللعضو.",
    ],
    subline: "ماذا يستفيد العضو، ولأي مدة، وبأي شروط؟",
    points: ["الخدمات المشمولة", "مدة الاستفادة", "شروط الاستخدام"],
    destination: "/solutions/memberships",
  },
  {
    theme: "reception-handoff",
    category: "members",
    screen: "attendance",
    scene: "reception",
    title: "تسليم الاستقبال",
    headlines: [
      "تغيّر الموظف.\nوالمعلومة تكمل معه.",
      "خدمة متصلة،\nحتى مع تبدّل الوردية.",
      "تسليم الاستقبال\nيبدأ من سجل واضح.",
      "لا تجعل خدمة العضو\nتبدأ من الصفر كل وردية.",
    ],
    subline: "راجع الحالة والسجل وحدّد الإجراء الذي يحتاج متابعة.",
    points: ["حالة الاشتراك", "سجل الزيارة", "مسؤول المتابعة"],
    destination: "/solutions/memberships",
  },
  {
    theme: "academy-groups",
    category: "bookings",
    screen: "bookings",
    scene: "court",
    title: "مجموعات الأكاديمية",
    headlines: [
      "مجموعة جديدة؟\nاحسب السعة أولًا.",
      "جدول الأكاديمية\nيبدأ من قدرة الملعب.",
      "لكل مجموعة موعد.\nولكل مرفق سعة.",
      "قبل فتح مجموعة تدريب،\nراجع تفاصيل إتاحتها.",
    ],
    subline: "المرفق والتوقيت وعدد المقاعد قبل تأكيد الحجز.",
    points: ["المرفق المناسب", "الفترة المتاحة", "السعة المحددة"],
    destination: "/solutions/bookings",
  },
  {
    theme: "personal-training",
    category: "bookings",
    screen: "bookings",
    scene: "gym",
    title: "التدريب الشخصي",
    headlines: [
      "جلسة شخصية؟\nراجع وقتها وموردها.",
      "جلسة التدريب\nتحتاج تنسيقًا قبل التأكيد.",
      "وضوح الجلسة\nيبدأ بإعداد الحجز.",
      "رتّب جلسات التدريب\nوفق الإتاحة الفعلية.",
    ],
    subline: "خدمة وموعد ومورد يناسب تنفيذ الجلسة.",
    points: ["نوع الجلسة", "المورد المرتبط", "الفترة والحالة"],
    destination: "/solutions/bookings",
  },
  {
    theme: "booking-policy",
    category: "bookings",
    screen: "bookings",
    scene: "court",
    title: "سياسة الحجز",
    headlines: [
      "تأجل الموعد؟\nارجع للسياسة.",
      "سياسة الحجز الواضحة\nتسبق اختلاف التوقعات.",
      "قبل تأكيد الموعد،\nوضّح شروط تغييره.",
      "التعديل والإلغاء\nيحتاجان سياسة يعرفها الجميع.",
    ],
    subline: "اتفق على الضوابط، ثم راجع الإجراء المسموح.",
    points: ["موعد الإلغاء", "ضوابط التعديل", "الموظف المخوّل"],
    destination: "/solutions/bookings",
  },
  {
    theme: "shift-difference",
    category: "finance",
    screen: "finance",
    scene: "workspace",
    title: "مراجعة الوردية",
    headlines: [
      "فيه فرق بالوردية؟\nابدأ من الحركة.",
      "فرق التسوية\nسؤال يحتاج تتبّعًا.",
      "اختلاف الإجماليات؟\nراجع العمليات أولًا.",
      "عند اختلاف الأرقام،\nارجع إلى تفاصيل الوردية.",
    ],
    subline: "قارن سجلات البيع والتحصيل قبل اعتماد التسوية.",
    points: ["الفواتير", "سجلات التحصيل", "تسوية الوردية"],
    destination: "/solutions/operations",
  },
  {
    theme: "refund-review",
    category: "finance",
    screen: "finance",
    scene: "reception",
    title: "مراجعة المرتجعات",
    headlines: [
      "طلب استرجاع؟\nراجع العملية الأصلية.",
      "المرتجع يحتاج\nسجلًا وصلاحية.",
      "الاسترجاع إجراء\nيبدأ بمراجعة الفاتورة.",
      "قبل اعتماد المرتجع،\nوضّح مسار المراجعة.",
    ],
    subline: "الفاتورة وسبب الطلب والسياسة المعتمدة للمؤسسة.",
    points: ["العملية الأصلية", "سبب الاسترجاع", "الصلاحية المناسبة"],
    destination: "/solutions/operations",
  },
  {
    theme: "retail-service",
    category: "finance",
    screen: "finance",
    scene: "inventory",
    title: "بيع المنتجات",
    headlines: [
      "باع منتجًا؟\nكمّل تسجيل العملية.",
      "نقطة البيع\nجزء من يوم النادي.",
      "بيع المنتج\nله فاتورة وتحصيل.",
      "من اختيار المنتج\nإلى مراجعة عملية البيع.",
    ],
    subline: "منتجات المتجر جزء من المتابعة التشغيلية والمالية.",
    points: ["اختيار المنتج", "إصدار الفاتورة", "تسجيل التحصيل"],
    destination: "/solutions/operations",
  },
  {
    theme: "kitchen-handoff",
    category: "food-stock",
    screen: "kitchen",
    scene: "kitchen",
    title: "تسليم طلب المطبخ",
    headlines: [
      "جاهز للتسليم؟\nراجع الطلب نفسه.",
      "آخر خطوة في المطبخ\nتحتاج وضوحًا أيضًا.",
      "الطلب الجاهز\nيحتاج تسليمًا منظمًا.",
      "بين التحضير والتسليم،\nراجع تفاصيل الطلب.",
    ],
    subline: "طابق الطلب وحالته قبل إتمام التسليم.",
    points: ["تفاصيل الطلب", "حالة التحضير", "تأكيد التسليم"],
    destination: "/solutions/operations",
  },
  {
    theme: "menu-preparation",
    category: "food-stock",
    screen: "restaurant",
    scene: "kitchen",
    title: "تجهيز قائمة اليوم",
    headlines: [
      "قبل وقت الزحمة،\nراجع قائمة اليوم.",
      "قائمة واضحة\nقبل بداية الخدمة.",
      "استعداد المطبخ\nيبدأ بما هو متاح اليوم.",
      "جهّز قائمة اليوم\nمع فريق المطبخ والاستقبال.",
    ],
    subline: "اختيار الوجبات والكميات ومراجعتها قبل بدء الخدمة.",
    points: ["الوجبات المتاحة", "الكميات المسجلة", "جاهزية الفريق"],
    destination: "/solutions/operations",
  },
  {
    theme: "stock-count",
    category: "food-stock",
    screen: "inventory",
    scene: "inventory",
    title: "مراجعة المخزون",
    headlines: [
      "الرصيد مطابق؟\nراجع المنتج والفرع.",
      "المخزون المسجل\nيحتاج مراجعة ميدانية.",
      "الجرد يبدأ\nبمنتج وفرع محدّدين.",
      "طابق ما في الرف\nمع رصيد المنتج في النظام.",
    ],
    subline: "تتبّع الفرق وراجع حركات المنتج قبل التعديل.",
    points: ["تحديد الفرع", "مراجعة الحركات", "توثيق سبب التعديل"],
    destination: "/solutions/operations",
  },
  {
    theme: "branch-readiness",
    category: "team",
    screen: "branches",
    scene: "workspace",
    title: "جاهزية الفرع",
    headlines: [
      "فرع جديد؟\nراجع جاهزيته.",
      "فتح الفرع\nيبدأ قبل يوم الافتتاح.",
      "قبل إضافة فرع،\nحدّد نطاق تشغيله.",
      "توسّع بخطة\nيفهمها فريق الفرع الجديد.",
    ],
    subline: "الخدمات والفريق والصلاحيات وخطة البدء.",
    points: ["الخدمات الفعلية", "مسؤولو التشغيل", "تجربة دورة عمل"],
    destination: "/solutions/branches",
  },
  {
    theme: "team-practice",
    category: "team",
    screen: "staff",
    scene: "gym",
    title: "تدريب الفريق",
    headlines: [
      "موظف جديد؟\nجرّب معه يوم عمل.",
      "التدريب العملي\nيبدأ من دور الموظف.",
      "لا تكتفِ بشرح الشاشة.\nجرّب الإجراء كاملًا.",
      "جهّز فريقك\nبمواقف من عمله اليومي.",
    ],
    subline: "سيناريو واقعي وصلاحية مناسبة ومراجعة للنتيجة.",
    points: ["حدّد الدور", "نفّذ سيناريو", "راجع النتيجة"],
    destination: "/solutions/branches",
  },
  {
    theme: "access-review",
    category: "team",
    screen: "roles",
    scene: "reception",
    title: "مراجعة الصلاحيات",
    headlines: [
      "تغيّر دوره؟\nراجع صلاحياته.",
      "مسؤولية جديدة؟\nراجع نطاق الوصول.",
      "الصلاحية تتبع الدور.\nوالدور يحتاج مراجعة.",
      "راجع صلاحيات الفريق\nكلما تغيّرت المسؤوليات.",
    ],
    subline: "ما الذي يحتاجه الموظف لأداء عمله بالفعل؟",
    points: ["دور الموظف", "نطاق الفرع", "العمليات المتاحة"],
    destination: "/solutions/branches",
  },
  {
    theme: "season-readiness",
    category: "growth",
    screen: "overview",
    scene: "court",
    title: "الاستعداد للمواسم",
    headlines: [
      "موسم مزدحم قريب؟\nابدأ من خطة التشغيل.",
      "قبل زيادة الإقبال،\nراجع جاهزية يومك.",
      "التخطيط للموسم\nيبدأ من قدرة التشغيل.",
      "جهّز مؤسستك للموسم\nبمراجعة عملية واضحة.",
    ],
    subline: "راجع الإتاحة والفريق والخدمات قبل نشر العرض.",
    points: ["السعة المتاحة", "تغطية الفريق", "شروط الخدمة"],
    destination: "/articles",
  },
  {
    theme: "software-questions",
    category: "growth",
    screen: "overview",
    scene: "workspace",
    title: "اختيار النظام",
    headlines: [
      "تختار نظامًا؟\nخذ أسئلتك معك.",
      "المقارنة المفيدة\nتبدأ من احتياجك.",
      "قيّم نظامك القادم\nبدورة عمل حقيقية.",
      "قبل اختيار نظام الإدارة،\nاختبر ما يحتاجه فريقك.",
    ],
    subline: "مشاهدة المهمة كاملة أهم من قائمة خصائص طويلة.",
    points: ["حالة من عملك", "تجربة مع الفريق", "نطاق وتكلفة"],
    destination: "/contact",
  },
  {
    theme: "weekly-review",
    category: "growth",
    screen: "overview",
    scene: "workspace",
    title: "المراجعة الأسبوعية",
    headlines: [
      "اجتماع الأسبوع؟\nابدأ بسؤال محدّد.",
      "متابعة أسبوعية\nتنتهي بخطوة واضحة.",
      "كل مراجعة تشغيل\nتحتاج قرارًا ومسؤولًا.",
      "حوّل اجتماع التشغيل\nإلى إجراءات يمكن متابعتها.",
    ],
    subline: "ملاحظة من السجلات، وإجراء، ومسؤول، وموعد مراجعة.",
    points: ["ما الذي ظهر؟", "من يتابع؟", "متى نراجع؟"],
    destination: "/articles",
  },
  {
    theme: "integration-brief",
    category: "brand",
    screen: "services",
    scene: "workspace",
    title: "نطاق التكامل",
    headlines: [
      "تحتاج ربطًا؟\nخلّنا نحدّد المطلوب.",
      "الفكرة التقنية\nتحتاج وصفًا قابلًا للتقييم.",
      "طلب التكامل يبدأ\nبوصف دورة العمل.",
      "صف احتياج التكامل،\nثم ناقش التوافق والنطاق.",
    ],
    subline: "نقيّم الأنظمة والأجهزة قبل الاتفاق على التنفيذ.",
    points: ["الأنظمة الحالية", "البيانات المطلوبة", "المسؤوليات والتكلفة"],
    destination: "/contact",
  },
  {
    theme: "annual-scope",
    category: "brand",
    screen: "services",
    scene: "gym",
    title: "نطاق الاشتراك السنوي",
    headlines: [
      "اشتراك سنوي؟\nاعرف نطاقه أولًا.",
      "ابدأ بالنطاق\nالذي يحتاجه تشغيلك.",
      "قيمة الاشتراك\nتبدأ بوضوح ما يشمله.",
      "ناقش نطاق نرفد\nوفق خدمات مؤسستك وفروعها.",
    ],
    subline: "وضوح الوظائف والفروع والتجهيز والخدمات الإضافية.",
    points: ["الوظائف المشمولة", "الفروع المطلوبة", "الإضافات المتفق عليها"],
    destination: "/contact",
  },
];

export function createExpansionPosts(platform: SocialPlatform): SocialPost[] {
  const position = { snapchat: 0, instagram: 1, x: 2, facebook: 3 }[
    platform.id
  ];
  return topics.map((topic, index) => {
    const headline = topic.headlines[position];
    return {
      id: String(index + 31),
      platform: platform.id,
      theme: topic.theme,
      category: topic.category,
      scene: topic.scene,
      screenshot: topic.screen,
      imageStyle: index % 3 === 1 ? "wide" : "focus",
      eyebrow: topic.title,
      headline,
      subline: topic.subline,
      points: topic.points,
      caption: socialCaptions[platform.id][index + 30],
      alt: `${headline.replaceAll("\n", " ")} — ${topic.subline} ${topic.points.join("، ")}. لقطة فعلية من واجهة ${productScreens[topic.screen].label} بهوية نرفد وبيانات عرض تجريبية، ضمن محتوى إرشادي للمؤسسة؛ لا تعرض بيانات عميل أو نتائج أداء.`,
      cta:
        topic.category === "brand"
          ? "ناقش احتياج مؤسستك"
          : topic.category === "growth"
            ? "ابدأ مراجعتك مع الفريق"
            : "راجعها مع فريقك",
      goal: topic.category === "brand" ? "تقييم" : "تعليم",
      audience:
        topic.category === "growth" || topic.category === "brand"
          ? "مالك المؤسسة ومدير العمليات وصاحب القرار"
          : "مسؤول القسم والفريق الذي ينفّذ دورة العمل",
      destination: topic.destination,
      layout: "product",
    };
  });
}
