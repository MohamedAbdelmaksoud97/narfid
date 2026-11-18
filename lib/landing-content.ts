import {
  CalendarDays,
  ChartNoAxesCombined,
  ChefHat,
  GitBranch,
  Package,
  UsersRound,
  FileText,
  CreditCard,
  ClipboardCheck,
  Tags,
  ShieldCheck,
  TrendingUp,
  Dumbbell,
  Wallet,
  Ruler,
  ClipboardList,
  BriefcaseBusiness,
} from "lucide-react";

export const salesPhone = "201066471110";
export const whatsappUrl = `https://wa.me/${salesPhone}`;

export const navigation = [
  { label: "المنظومة", href: "#platform" },
  { label: "لماذا نرفد؟", href: "#why-nerved" },
  { label: "تطبيق الأعضاء", href: "#member-app" },
  { label: "الهوية البصرية", href: "#visual-identity" },
  { label: "الباقات", href: "#pricing" },
  { label: "الأسئلة الشائعة", href: "#faq" },
  { label: "المقالات", href: "/articles" },
];

export const features = [
  {
    number: "01",
    icon: UsersRound,
    title: "الأعضاء والاشتراكات",
    description:
      "ملف متكامل لكل عضو. اشتراكات وتجديدات وتجميد وحضور، في رحلة واضحة من أول زيارة.",
    detail: "من الاستقبال إلى التجديد",
    kind: "members",
  },
  {
    number: "02",
    icon: ChartNoAxesCombined,
    title: "المالية ونقاط البيع",
    description:
      "اربط المبيعات والفواتير والتحصيل والورديات، وتابع حركة ناديك المالية من مكان واحد.",
    detail: "كل حركة لها صورة أوضح",
    kind: "finance",
  },
  {
    number: "03",
    icon: ChefHat,
    title: "المطبخ والتغذية",
    description:
      "نظّم قوائم الوجبات والكميات اليومية والتحضير وصرف الوجبات المرتبطة باشتراكات الأعضاء.",
    detail: "من قائمة اليوم إلى التسليم",
    kind: "kitchen",
  },
  {
    number: "04",
    icon: Package,
    title: "المنتجات والمخزون",
    description:
      "تابع مخزون المنتجات لكل فرع، والاستلام والبيع والمرتجعات وحدود إعادة الطلب.",
    detail: "تعرف المتاح قبل أن تبيع",
    kind: "inventory",
  },
  {
    number: "05",
    icon: CalendarDays,
    title: "الحجوزات والمواعيد",
    description:
      "رتّب حجوزات الملاعب والحصص والتدريب الشخصي، وتابع السعة والمواعيد والمشاركين.",
    detail: "مساحة منظّمة لكل نشاط",
    kind: "bookings",
  },
  {
    number: "06",
    icon: GitBranch,
    title: "الفروع وفريق العمل",
    description:
      "إدارة موحّدة للفروع، وصلاحيات حسب الدور، وتقارير تساعدك تتابع الصورة الكاملة.",
    detail: "فروع متعددة. رؤية واحدة.",
    kind: "branches",
  },
] as const;

export const pricingFeatures = [
  { label: "فواتير غير محدودة", icon: FileText, from: 0 },
  { label: "نقاط البيع وورديات الصندوق", icon: CreditCard, from: 0 },
  { label: "طلبات الخدمات أونلاين", icon: ClipboardCheck, from: 1 },
  { label: "إدارة الأعضاء والاشتراكات", icon: UsersRound, from: 0 },
  { label: "التجديد والتجميد والحضور", icon: CalendarDays, from: 0 },
  { label: "إدارة الخدمات والعروض", icon: Tags, from: 0 },
  { label: "صلاحيات المستخدمين", icon: ShieldCheck, from: 0 },
  { label: "الإيرادات والتحصيل والمرتجعات", icon: TrendingUp, from: 0 },
  { label: "إدارة المدربين", icon: Dumbbell, from: 1 },
  { label: "إدارة المصروفات", icon: Wallet, from: 0 },
  { label: "إدارة القياسات", icon: Ruler, from: 1 },
  { label: "البرامج التدريبية", icon: ClipboardList, from: 1 },
  { label: "التقارير", icon: ChartNoAxesCombined, from: 0 },
  { label: "جداول ودوام الموظفين", icon: BriefcaseBusiness, from: 1 },
  { label: "المنتجات والمخزون", icon: Package, from: 1 },
  { label: "المطبخ واشتراكات الوجبات", icon: ChefHat, from: 2 },
  { label: "حجوزات الملاعب والحصص والتدريب", icon: CalendarDays, from: 3 },
  { label: "إدارة مركزية لفرعين", icon: GitBranch, from: 3 },
] as const;

export const memberPolicy = {
  definition:
    "يشمل العدد كل عضو مسجّل لدى المؤسسة، سواء كان اشتراكه ساريًا أو مجمّدًا أو منتهيًا، بما في ذلك ملفات الأعضاء القديمة. يُحسب العضو مرة واحدة مهما تعددت اشتراكاته أو الفروع التي يستخدمها؛ العملاء المحتملون قبل تسجيلهم كأعضاء خارج العدد.",
  upgrade:
    "عند تجاوز حد الباقة نراجع معك الترقية ونمنح مهلة متفقًا عليها لاستكمالها؛ لا يتوقف التشغيل فورًا بسبب التجاوز.",
  venues:
    "للملاعب التي تعتمد على حجوزات الزوار، نحدد عرضًا يناسب طريقة التشغيل؛ عدد العضويات وحده لا يكفي لاختيار الباقة.",
} as const;

export const plans = [
  {
    name: "أساس",
    english: "ESSENTIAL",
    description: "بداية مرتّبة لناديك",
    annual: 1440,
    monthly: 120,
    memberLimit: 1000,
    userLimit: 2,
    branches: "فرع واحد",
    recommended: false,
    features: pricingFeatures.filter((feature) => feature.from === 0).map((feature) => feature.label),
    cta: "ابدأ مع أساس",
  },
  {
    name: "نمو",
    english: "GROWTH",
    description: "مساحة أكبر لنمو عضويتك",
    annual: 3300,
    monthly: 275,
    memberLimit: 5000,
    userLimit: 5,
    branches: "فرع واحد",
    recommended: false,
    features: pricingFeatures.filter((feature) => feature.from <= 1).map((feature) => feature.label),
    cta: "اختر باقة نمو",
  },
  {
    name: "احتراف",
    english: "PROFESSIONAL",
    description: "للمؤسسة ذات العضوية الأكبر",
    annual: 4200,
    monthly: 350,
    memberLimit: 10000,
    userLimit: 10,
    branches: "فرع واحد",
    recommended: true,
    features: pricingFeatures.filter((feature) => feature.from <= 2).map((feature) => feature.label),
    cta: "اختر باقة احتراف",
  },
  {
    name: "توسّع",
    english: "SCALE",
    description: "منظومة تنمو مع طموحك",
    annual: 6600,
    monthly: 550,
    memberLimit: null,
    userLimit: null,
    branches: "فرعان",
    recommended: false,
    features: pricingFeatures.map((feature) => feature.label),
    cta: "خطّط لتوسّعك",
  },
] as const;

export const faqs = [
  {
    question: "هل تقدم نرفد تصميم الهوية البصرية للمؤسسة؟",
    answer:
      "نعم، يمكنك طلب تأسيس هوية جديدة أو تطوير هوية قائمة أو تطبيقها رقميًا. الخدمة اختيارية وبعرض سعر مستقل عن اشتراك المنصة؛ نحدد التسليمات والمدة وجولات التعديل وتطبيقات الهوية قبل الاتفاق.",
  },
  {
    question: "هل نرفد مناسب لنوع مؤسستي الرياضية؟",
    answer:
      "نرفد يخدم الأندية والأكاديميات ومراكز اللياقة والمؤسسات التي تدير عضويات أو مرافق وحجوزات. نراجع عدد الأعضاء المسجلين والفروع وطريقة التشغيل لاختيار الباقة. للملاعب المعتمدة على حجوزات الزوار نحدد عرضًا يناسب نشاطها.",
  },
  {
    question: "كيف تُحسب قيمة الاشتراك؟",
    answer:
      "الباقات المعروضة سنوية. القيمة الشهرية الظاهرة للمقارنة فقط، ويكون التعاقد والفوترة سنويًا. تُحدَّد الضرائب والتهيئة ونقل البيانات والتدريب والدعم وأي نطاق إضافي في عرض السعر النهائي قبل التعاقد.",
  },
  {
    question: "هل يمكنني ترقية الباقة أو إضافة فروع؟",
    answer:
      "نعم. أساس تشمل ١٬٠٠٠ عضو ومستخدمين اثنين، ونمو ٥٬٠٠٠ عضو و٥ مستخدمين، واحتراف ١٠٬٠٠٠ عضو و١٠ مستخدمين؛ هذه الباقات لفرع واحد. توسّع بعدد أعضاء ومستخدمين غير محدود وتشمل إدارة فرعين. لثلاثة فروع فأكثر نحدد شراكة تقنية بعرض سعر مخصص دون اشتراط تطوير خاص.",
  },
  {
    question: "هل نقاط البيع وورديات الصندوق متاحة في كل الباقات؟",
    answer:
      "نعم، نقاط البيع وورديات الصندوق والفواتير والتحصيل والمرتجعات ضمن كل الباقات. المدربون والقياسات والبرامج التدريبية وجداول الموظفين والمنتجات والمخزون من نمو، والمطبخ والوجبات من احتراف، والحجوزات وإدارة الفرعين في توسّع. لا تعني الفواتير ربطًا مثبتًا مع فاتورة أو هيئة الزكاة والضريبة والجمارك.",
  },
  {
    question: "من المقصود بالمستخدمين في الباقة؟",
    answer:
      "هم حسابات فريق العمل التي تدخل إلى لوحة إدارة المؤسسة، وليس حسابات الأعضاء. تشمل أساس مستخدمين اثنين، ونمو ٥، واحتراف ١٠، وتوسّع مستخدمين غير محدودين.",
  },
  {
    question: "كيف يُحسب عدد الأعضاء المسجلين؟",
    answer: memberPolicy.definition,
  },
  {
    question: "ماذا يحدث عند تجاوز حد الأعضاء في الباقة؟",
    answer: memberPolicy.upgrade,
  },
  {
    question: "هل يمكن نقل بيانات النادي الحالية؟",
    answer:
      "نراجع معك ملفات الأعضاء والاشتراكات والبيانات المتاحة قبل البدء، ونتفق على البيانات التي يمكن نقلها وطريقة التحقق منها. نطاق النقل وتجهيز البيانات يُحدَّدان حسب حالة النظام الحالي.",
  },
  {
    question: "هل تشمل الباقات تطبيقًا خاصًا أو ربط بوابات الدخول؟",
    answer:
      "هذه الخدمات تُطلب ضمن الشراكة التقنية بإضافة نطاق مخصص إلى اشتراك المنصة. ندرس نوع الأجهزة والأنظمة المطلوبة، ثم نقدّم عرضًا يوضح التطوير والتكامل والأجهزة والصيانة كلًّا على حدة.",
  },
  {
    question: "كيف أحجز عرضًا توضيحيًا للمنصة؟",
    answer:
      "اضغط على «احجز عرضًا توضيحيًا»، وأدخل اسمك واسم مؤسستك وعدد فروعها والباقة التي تهمك. بعد مراجعة التفاصيل، تابع عبر واتساب وأرسل الطلب لنتفق معك على موعد مناسب ونستعرض ما تحتاجه مؤسستك.",
  },
];
