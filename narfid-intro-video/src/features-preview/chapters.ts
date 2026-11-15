export type Shot = {
  at: number;
  file: string;
  label: string;
  note?: string;
  focus?: readonly [x: number, y: number, zoom: number];
  fit?: boolean;
};

export type Chapter = {
  at: number;
  title: string;
  dark?: boolean;
  wide?: boolean;
  shots: readonly Shot[];
};

const localScreen = "features-preview/screens";

export const chapters = [
  {
    at: 20,
    title: "الأعضاء والاشتراكات",
    shots: [
      {
        at: 20,
        file: "gates/membership.png",
        label: "تاريخ انتهاء الاشتراك",
        focus: [462, 646, 1.55],
      },
      {
        at: 23.4,
        file: "club-day/member-renew.jpg",
        label: "تجديد العضوية",
        focus: [810, 478, 1.28],
      },
      {
        at: 25.25,
        file: "freeze-policy/schedule.jpg",
        label: "جدولة التجميد",
        note: "حسب سياسة الباقة",
        focus: [790, 469, 1.28],
      },
    ],
  },
  {
    at: 27.65,
    title: "الحضور والتحقق من الدخول",
    dark: true,
    shots: [
      {
        at: 27.65,
        file: `${localScreen}/check-in.jpg`,
        label: "باركود العضوية",
        note: "تحديد العضو والاشتراك",
        focus: [790, 407, 1.28],
      },
      {
        at: 32.0,
        file: "gates/membership.png",
        label: "صلاحية الاشتراك",
        note: "الفرع، مدة الاشتراك، والزيارات",
        focus: [477, 669, 1.55],
      },
      {
        at: 36.06,
        file: `${localScreen}/attendance.jpg`,
        label: "نتيجة تسجيل الحضور",
        note: "سجل المحاولات وأسباب الرفض",
        focus: [728, 427, 1.22],
      },
    ],
  },
  {
    at: 39.18,
    title: "الحجوزات والمواعيد",
    wide: true,
    shots: [
      {
        at: 39.18,
        file: "club-day/booking-form.jpg",
        label: "حصة اللياقة المسائية",
        focus: [794, 386, 1.28],
      },
      {
        at: 45.45,
        file: "club-day/booking-form.jpg",
        label: "المواعيد والمقاعد المتاحة",
        focus: [818, 569, 1.58],
      },
      {
        at: 49.85,
        file: "club-day/booking-confirmed.jpg",
        label: "حالة الحجز",
        focus: [703, 451, 1.31],
      },
      {
        at: 52.11,
        file: "club-day/booking-confirmed.jpg",
        label: "الملاعب والحصص والتدريب الشخصي",
        focus: [730, 381, 1.21],
      },
    ],
  },
  {
    at: 57.17,
    title: "نقطة البيع والمالية",
    shots: [
      {
        at: 57.17,
        file: "retail-film/receipt.jpg",
        label: "بيع من المتجر",
        note: "الأصناف والإجمالي في فاتورة واحدة",
        fit: true,
      },
      {
        at: 59.65,
        file: `${localScreen}/split-invoice.jpg`,
        label: "تحصيل مجزّأ",
        note: "دفعة نقدية وأخرى بالبطاقة",
        focus: [708, 599, 1.25],
      },
      {
        at: 65.88,
        file: `${localScreen}/cash-shifts.jpg`,
        label: "كشف وردية الصندوق",
        focus: [710, 450, 1.19],
      },
      {
        at: 69.29,
        file: `${localScreen}/finance.jpg`,
        label: "الاسترداد والمصروفات",
        focus: [706, 404, 1.22],
      },
    ],
  },
  {
    at: 74.0,
    title: "المطبخ والوجبات",
    dark: true,
    wide: true,
    shots: [
      {
        at: 74.0,
        file: "kitchen/01-new.jpg",
        label: "قائمة اليوم والكميات المتاحة",
        focus: [688, 478, 1.24],
      },
      {
        at: 79.86,
        file: "kitchen/01-new.jpg",
        label: "صرف وجبة من الاشتراك",
        focus: [1083, 879, 1.53],
      },
      {
        at: 85.68,
        file: "kitchen/02-preparing.jpg",
        label: "قيد التحضير",
        focus: [680, 879, 1.58],
      },
      {
        at: 88.52,
        file: "kitchen/03-ready.jpg",
        label: "جاهز للاستلام",
        focus: [431, 866, 1.51],
      },
    ],
  },
  {
    at: 91.19,
    title: "المتجر والمخزون",
    shots: [
      {
        at: 91.19,
        file: "retail-film/stock-sold.jpg",
        label: "الكمية المتاحة بعد البيع",
        note: "الرصيد حسب الفرع",
        fit: true,
      },
      {
        at: 96.2,
        file: "retail-film/stock-received.jpg",
        label: "الاستلام والمرتجعات",
        fit: true,
      },
      {
        at: 99.24,
        file: "retail-film/stock-sold.jpg",
        label: "حد إعادة الطلب",
        note: "يضبط الفريق الحد لكل صنف",
        fit: true,
      },
    ],
  },
  {
    at: 102.85,
    title: "بوابة العضو وولي الأمر",
    shots: [
      {
        at: 102.85,
        file: `${localScreen}/member-portal.jpg`,
        label: "الاشتراك والفواتير",
        note: "من بوابة العضو",
        focus: [835, 409, 1.21],
      },
      {
        at: 107.05,
        file: `${localScreen}/member-booking.jpg`,
        label: "طلب حجز",
        note: "المواعيد المتاحة في الفرع",
        focus: [818, 360, 1.22],
      },
      {
        at: 110.67,
        file: `${localScreen}/member-booking.jpg`,
        label: "وصول ولي الأمر",
        note: "متابعة عضوية الابن والحجز له حسب الصلاحيات",
        focus: [832, 374, 1.27],
      },
    ],
  },
  {
    at: 118.3,
    title: "إدارة الفريق والمتابعات",
    wide: true,
    shots: [
      {
        at: 118.3,
        file: `${localScreen}/operations.jpg`,
        label: "ورديات الفريق",
        focus: [722, 421, 1.17],
      },
      {
        at: 120.68,
        file: `${localScreen}/positions.jpg`,
        label: "الصلاحيات بحسب الدور",
        focus: [728, 461, 1.19],
      },
      {
        at: 123.15,
        file: `${localScreen}/trainer.jpg`,
        label: "خطط التدريب والقياسات",
        focus: [728, 433, 1.2],
      },
      {
        at: 126.46,
        file: `${localScreen}/crm.jpg`,
        label: "العملاء المحتملون والمتابعة",
        focus: [728, 457, 1.2],
      },
    ],
  },
  {
    at: 133.08,
    title: "الفروع والتقارير",
    dark: true,
    wide: true,
    shots: [
      {
        at: 133.08,
        file: `${localScreen}/reports.jpg`,
        label: "الفرع والفترة",
        focus: [743, 365, 1.21],
      },
      {
        at: 136.73,
        file: `${localScreen}/dashboard.jpg`,
        label: "الحضور والإيرادات",
        focus: [716, 479, 1.23],
      },
      {
        at: 139.02,
        file: `${localScreen}/expiry.jpg`,
        label: "الاشتراكات القريبة من الانتهاء",
        focus: [717, 516, 1.15],
      },
      {
        at: 146.38,
        file: `${localScreen}/reports.jpg`,
        label: "تقارير الفروع حسب الصلاحية",
        focus: [733, 328, 1.25],
      },
    ],
  },
] as const satisfies readonly Chapter[];

export const closingAt = 152.16;
