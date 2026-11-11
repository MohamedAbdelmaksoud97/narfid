import { refreshedCopy, refreshedLinkedIn } from "./refreshed-copy.ar";
import { productScreens } from "./product-posts";
import type { SocialPost } from "./social";

export const stockScenes = {
  arena: { file: "photography/arena.jpg", description: "صالة رياضية داخلية" },
  desk: { file: "photography/desk.jpg", description: "مكتب إداري" },
  meals: { file: "photography/meals.jpg", description: "وجبات مقسّمة في علب" },
  meeting: { file: "photography/meeting.jpg", description: "غرفة اجتماعات" },
  pool: { file: "photography/pool.jpg", description: "مسبح تدريب داخلي" },
  prep: { file: "photography/prep.jpg", description: "علب وجبات جاهزة" },
  studio: { file: "photography/studio.jpg", description: "صالة لياقة بأجهزة تدريب" },
  terminal: { file: "photography/terminal.jpg", description: "جهاز دفع عند نقطة البيع" },
  towels: { file: "photography/towels.jpg", description: "رف مناشف مرتبة" },
  training: { file: "photography/training.jpg", description: "مساحة تدريب بأجهزة وأوزان" },
} as const;

type Scene = SocialPost["scene"];
type SceneDetails = { file: string; description: string };

const alternatives: Partial<Record<Scene, readonly Scene[]>> = {
  court: ["arena", "pool", "studio", "training"],
  gym: ["studio", "training", "arena", "pool", "reception"],
  inventory: ["towels", "terminal"],
  kitchen: ["prep", "meals"],
  reception: ["terminal", "desk", "studio", "training", "workspace"],
  workspace: ["desk", "meeting", "reception", "studio"],
};

const topicScenes: Record<string, readonly Scene[]> = {
  "class-capacity": ["studio", "court", "arena", "training"],
  "cash-shifts": ["reception", "terminal", "desk"],
  "invoice-collection": ["reception", "terminal", "desk"],
  "shift-reconciliation": ["reception", "terminal", "desk"],
  "shift-difference": ["reception", "terminal", "desk"],
  "refund-review": ["reception", "terminal", "desk"],
  "retail-service": ["inventory", "terminal", "towels"],
  "demo-scenario": ["inventory", "terminal", "towels"],
  "gate-integration": ["reception", "studio", "workspace", "desk"],
  "gate-membership-policy": ["reception", "studio", "training", "workspace", "desk"],
  "gate-attendance-log": ["reception", "workspace", "desk", "meeting"],
  "gate-before-purchase": ["reception", "workspace", "desk", "meeting"],
  "gate-exceptions": ["reception", "studio", "workspace", "desk"],
};

const pointsByTheme: Record<string, string[]> = {
  brand: ["تجديد الاشتراك", "تأكيد الحجز", "تسجيل البيع"],
  bookings: ["مدة انتظار الدفع", "حالة الحجز", "إتاحة المقعد"],
  demo: ["الباقة الحالية", "تجديد الاشتراك", "تسجيل التحصيل"],
  "guided-demo": ["تسجيل البيع", "مطابقة التحصيل", "إقفال الوردية"],
  "personal-training": ["المدرب", "موعد الجلسة", "المكان"],
  "weekly-review": ["الحالات المفتوحة", "مسؤول المتابعة", "موعد المراجعة"],
  "app-feedback-reminders": ["نوع الملاحظة", "مسؤول المتابعة", "الرد على العضو"],
  "demo-scenario": ["البيع الأصلي", "تسجيل المرتجع", "رصيد الفرع"],
};

function selectScene(post: SocialPost, recent: readonly Scene[]): Scene {
  const candidates = topicScenes[post.theme] ?? [
    post.scene,
    ...(alternatives[post.scene] ?? []),
  ];
  const eligible = candidates.filter(
    (scene) => recent.filter((previous) => previous === scene).length < 3,
  );
  // Prefer the original scene when there is room to space out its appearances.
  if (eligible.includes(post.scene) && !recent.slice(-5).includes(post.scene)) {
    return post.scene;
  }
  const selected = eligible.toSorted(
    (a, b) => recent.lastIndexOf(a) - recent.lastIndexOf(b),
  )[0];
  if (!selected) throw new Error(`No suitable image for ${post.platform}/${post.id}`);
  return selected;
}

function screenshotFor(post: SocialPost): SocialPost["screenshot"] {
  switch (post.theme) {
    case "demo": return "members";
    case "personal-training": return "staff";
    case "retail-service": return "inventory";
    case "weekly-review": return "branches";
    case "booking-policy":
    case "refund-review":
    case "guided-demo":
    case "software-questions": return undefined;
    default: return post.screenshot;
  }
}

export function refreshMarketingPosts(
  posts: SocialPost[],
  scenes: Record<Scene, SceneDetails>,
): SocialPost[] {
  const recent: Scene[] = [];
  return posts.map((post) => {
    if (post.platform === "facebook" || post.platform === "snapchat") return post;

    const [audience, cta, headline, caption] = post.platform === "linkedin"
      ? refreshedLinkedIn[post.id]
      : [
          refreshedCopy[post.id][0],
          refreshedCopy[post.id][1],
          ...refreshedCopy[post.id][post.platform === "instagram" ? 2 : 3],
        ];
    const scene = selectScene(post, recent.slice(-19));
    recent.push(scene);
    const screenshot = screenshotFor(post);
    const imageStyle = screenshot ? post.imageStyle ?? "wide" : undefined;
    const points = pointsByTheme[post.theme] ?? post.points;
    const layout = !screenshot && post.layout === "product" ? "checklist" : post.layout;
    const background = scene in stockScenes ? "صورة فوتوغرافية توضيحية" : "مشهد تصوري";
    const alt = `${headline} ${points.join("، ")}. ${background} لـ${scenes[scene].description}.${
      screenshot ? ` لقطة فعلية من شاشة ${productScreens[screenshot].label} ببيانات عرض.` : ""
    }`;
    return {
      ...post,
      scene,
      screenshot,
      imageStyle,
      layout,
      audience,
      eyebrow: audience,
      headline,
      subline: "",
      points,
      caption,
      cta,
      alt,
    };
  });
}
