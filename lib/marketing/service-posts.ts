import type { SocialPlatform, SocialPost } from "./social";
import { serviceCaptions } from "./service-copy.ar";

const topics = [
  {
    theme: "member-app",
    category: "member-app",
    scene: "gym",
    title: "تطبيق باسم مؤسستك",
    headlines: [
      "خدمات ناديك،\nفي جوال العضو.",
      "تطبيق يحمل هويتك.\nوخدمات يعرفها العضو.",
      "تطبيق الأعضاء\nيبدأ من نظام المؤسسة.",
      "تطبيق لناديك: الاشتراك\nوالحجز في مكان واحد.",
    ],
    subline: "نطوّر تطبيقًا بهويتك، مرتبطًا بمنظومة نرفد.",
    points: ["متابعة الاشتراك", "حجز الملاعب", "التواصل مع النادي"],
  },
  {
    theme: "app-renewals",
    category: "member-app",
    scene: "reception",
    title: "الاشتراك والتجديد",
    headlines: [
      "متى ينتهي اشتراكي؟\nالجواب في التطبيق.",
      "تفاصيل العضوية\nأقرب لعضوك.",
      "حالة الاشتراك والتجديد\nضمن تجربة واحدة.",
      "خلّ عضو ناديك يتابع\nاشتراكه ويبدأ التجديد.",
    ],
    subline: "حالة العضوية وموعد انتهائها ومسار تجديدها.",
    points: ["حالة الاشتراك", "تاريخ الانتهاء", "خطوات التجديد"],
  },
  {
    theme: "app-court-booking",
    category: "member-app",
    scene: "court",
    title: "الحجز من الجوال",
    headlines: [
      "ملعب ووقت مناسب.\nمن جوال العضو.",
      "من اختيار الملعب\nإلى تفاصيل الحجز.",
      "اربط حجز العضو\nبجدول مؤسستك.",
      "خلّ العضو يختار الملعب\nوالموعد من تطبيق ناديك.",
    ],
    subline: "طلبات حجز تصل إلى فريقك في النظام.",
    points: ["استعراض الإتاحة", "اختيار الموعد", "متابعة الحجز"],
  },
  {
    theme: "app-feedback-reminders",
    category: "member-app",
    scene: "workspace",
    title: "تواصل وتنبيهات",
    headlines: [
      "صوت العضو يوصل.\nوالتجديد في باله.",
      "اقتراح يُتابَع.\nوتنبيه في وقته.",
      "التواصل مع العضو\nجزء من نطاق التطبيق.",
      "استقبل شكوى العضو\nوذكّره بموعد التجديد.",
    ],
    subline: "شكاوى واقتراحات وتنبيهات قرب انتهاء الاشتراك.",
    points: ["إرسال الملاحظات", "متابعة رد الفريق", "تذكير بالتجديد"],
  },
  {
    theme: "gate-integration",
    category: "access",
    scene: "reception",
    title: "بوابات الدخول",
    headlines: [
      "بوابة ناديك\nجزء من المنظومة.",
      "اربط الدخول\nبسياق العضوية.",
      "تكامل بوابة الدخول\nيبدأ بفحص التوافق.",
      "اربط بوابة دخول النادي\nبنظام الإدارة.",
    ],
    subline: "نراجع الجهاز وطريقة الربط وسياسات الدخول.",
    points: ["فحص التوافق", "ضبط السياسات", "اختبار الربط"],
  },
  {
    theme: "gate-membership-policy",
    category: "access",
    scene: "gym",
    title: "سياسة الدخول",
    headlines: [
      "الاشتراك والدخول.\nاتفق على القاعدة.",
      "خلف كل دخول\nسياسة يعرفها الفريق.",
      "قرار الدخول يحتاج\nقواعد اشتراك واضحة.",
      "ماذا يحدث عند البوابة\nإذا انتهى الاشتراك؟",
    ],
    subline: "حدّد قواعد العضوية قبل تنفيذ تكامل البوابة.",
    points: ["اشتراك نشط", "اشتراك منتهٍ", "حالات الاستثناء"],
  },
  {
    theme: "gate-attendance-log",
    category: "access",
    scene: "workspace",
    title: "متابعة الدخول",
    headlines: [
      "محاولة دخول؟\nارجع إلى سجلّها.",
      "تفاصيل الدخول\nتساعد فريق الاستقبال.",
      "سجل الدخول\nيساعد على مراجعة الحالة.",
      "راجع وقت محاولة الدخول\nوقرار السماح أو الرفض.",
    ],
    subline: "معلومات تساعد الفريق في مراجعة حالة العضو.",
    points: ["وقت المحاولة", "طريقة الدخول", "قرار السماح"],
  },
  {
    theme: "gate-before-purchase",
    category: "access",
    scene: "reception",
    title: "قبل شراء البوابة",
    headlines: [
      "بتشتري بوابة؟\nراجع الربط أولًا.",
      "اختر بوابتك\nعلى أساس توافق واضح.",
      "فحص التوافق\nيسبق قرار شراء البوابة.",
      "قبل شراء بوابة جديدة،\nتأكد من إمكانية ربطها.",
    ],
    subline: "مواصفات الجهاز ووسيلة الاتصال وسيناريو الاختبار.",
    points: ["طراز الجهاز", "توثيق الربط", "خطة اختبار"],
  },
] as const;

export function createServicePosts(platform: SocialPlatform): SocialPost[] {
  const position = { snapchat: 0, instagram: 1, x: 2, facebook: 3 }[
    platform.id
  ];
  return topics.map((topic, index) => ({
    id: String(index + 51),
    platform: platform.id,
    theme: topic.theme,
    category: topic.category,
    scene: topic.scene,
    eyebrow: topic.title,
    headline: topic.headlines[position],
    subline: topic.subline,
    points: [...topic.points],
    caption: serviceCaptions[platform.id][index],
    alt: `${topic.headlines[position].replaceAll("\n", " ")} — ${topic.subline} ${topic.points.join("، ")}. تصميم بهوية نرفد مع مشهد تصوري لـ${topic.scene === "gym" ? "صالة تدريب" : topic.scene === "court" ? "ملعب" : topic.scene === "reception" ? "استقبال نادٍ" : "مساحة إدارة مؤسسة رياضية"} ورسم يشرح نطاق خدمة التطوير والتكامل؛ لا يعرض تطبيقًا منشورًا أو بيانات عميل.`,
    cta:
      topic.category === "member-app"
        ? "ناقش تطبيق مؤسستك"
        : "اطلب تقييم توافق البوابة",
    goal: "تقييم",
    audience: "مالك المؤسسة الرياضية ومدير العمليات",
    destination: "/technology-partnership",
    layout: topic.category === "member-app" ? "mobile-app" : "access-gate",
  }));
}
