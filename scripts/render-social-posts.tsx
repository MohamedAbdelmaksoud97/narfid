// Offline design/export tool. No credentials, customer data, or external publishing.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import {
  ArrowUpLeft,
  CalendarDays,
  Check,
  ClipboardCheck,
  Layers3,
  Network,
  Package,
  ReceiptText,
  Smartphone,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import {
  socialPlatforms,
  socialPosts,
  socialScenes,
  postFilename,
  postsFor,
  postText,
  type SocialPost,
} from "../lib/marketing/social";
import { productScreens } from "../lib/marketing/product-posts";

const root = process.cwd();
const output = join(root, "content/marketing/assets");
const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const uri = (buffer: Buffer, type = "image/png") =>
  `data:${type};base64,${buffer.toString("base64")}`;
const icons = [
  Users,
  CalendarDays,
  ReceiptText,
  UtensilsCrossed,
  Package,
  Network,
  ClipboardCheck,
  Smartphone,
  Layers3,
];
const icon = (index: number, size = 52) =>
  renderToStaticMarkup(
    createElement(icons[index % icons.length], {
      width: size,
      height: size,
      strokeWidth: 1.4,
    }),
  );
const arrow = renderToStaticMarkup(
  createElement(ArrowUpLeft, { width: 34, height: 34, strokeWidth: 1.8 }),
);
const check = renderToStaticMarkup(
  createElement(Check, { width: 32, height: 32, strokeWidth: 1.8 }),
);

async function fonts() {
  const dir = join(root, ".next/static/chunks");
  const faces = new Set<string>();
  for (const name of await readdir(dir)) {
    if (!name.endsWith(".css")) continue;
    const css = await readFile(join(dir, name), "utf8");
    for (const match of css.matchAll(
      /@font-face\{[^}]*font-family:Tajawal;[^}]*\}/g,
    ))
      faces.add(match[0]);
  }
  if (!faces.size)
    throw new Error(
      "Run npm run build first to prepare the project's Tajawal fonts.",
    );
  const embedded = [];
  for (const face of faces) {
    const file = face.match(/url\(\.\.\/media\/([^)]*)\)/)?.[1];
    if (!file)
      throw new Error("Unexpected font path; inspect the built Next.js CSS.");
    embedded.push(
      face
        .replace(
          /url\([^)]+\)/,
          `url(${uri(await readFile(join(root, ".next/static/media", file)), "font/woff2")})`,
        )
        .replace("font-display:swap", "font-display:block"),
    );
  }
  return embedded.join("\n");
}

function diagram(post: SocialPost, dashboard: string) {
  if (post.layout === "product")
    return `<div class="product-frame"><img src="${dashboard}" alt=""/></div><div class="product-points">${post.points.map((point) => `<span>${check}${escape(point)}</span>`).join("")}</div>`;
  const topicIcons: Record<string, number[]> = {
    brand: [0, 1, 8],
    memberships: [0, 1, 6],
    bookings: [1, 0, 6],
    "cash-shifts": [2, 2, 6],
    "meal-entitlements": [3, 3, 6],
    "retail-inventory": [4, 4, 4],
    branches: [5, 0, 8],
    migration: [6, 6, 0],
    partnership: [7, 5, 6],
    demo: [0, 8, 6],
  };
  const points = post.points
    .map(
      (point, index) =>
        `<div class="point"><span class="point-icon">${icon(topicIcons[post.theme][index], 48)}</span><div><span class="micro">${String(index + 1).padStart(2, "0")}</span><strong>${escape(point)}</strong></div></div>`,
    )
    .join("");
  if (post.layout === "hero")
    return `<div class="brand-orbit"><span class="orbit-ring"></span><div class="orbit-center">${icon(0, 86)}</div>${post.points.map((point, index) => `<span class="orbit-tag tag-${index}">${escape(point)}</span>`).join("")}</div>`;
  if (post.layout === "dashboard")
    return `<div class="dashboard-frame"><img src="${dashboard}" alt="" /></div><div class="mini-points">${post.points.map((point) => `<span>${check}${escape(point)}</span>`).join("")}</div>`;
  if (post.layout === "branches" || post.layout === "network")
    return `<div class="network"><div class="network-center">${post.layout === "branches" ? icon(5, 70) : icon(7, 70)}<span>${post.layout === "branches" ? "إدارة متصلة" : "شراكة تقنية"}</span></div><div class="network-line"></div><div class="network-nodes">${points}</div></div>`;
  if (post.layout === "schedule")
    return `<div class="court-diagram"><span></span><i></i><b></b><div>${icon(1, 64)}</div></div><div class="diagram-points">${points}</div>`;
  if (post.layout === "receipt")
    return `<div class="receipt"><div class="receipt-heading">${icon(2)}<span>مراجعة الوردية</span></div>${points}<div class="receipt-end"><span>دورة يمكن مراجعتها</span>${check}</div></div>`;
  if (post.layout === "checklist")
    return `<div class="checklist">${post.points.map((point, index) => `<div class="check-row"><span class="check-circle">${check}</span><strong>${escape(point)}</strong><small>0${index + 1}</small></div>`).join("")}</div>`;
  if (post.layout === "stock")
    return `<div class="stock"><div class="stock-symbol">${icon(4, 90)}</div><div class="stock-points">${points}</div></div>`;
  return `<div class="flow ${post.layout === "meal" ? "meal-flow" : ""}">${points}</div>`;
}

function html(
  post: SocialPost,
  width: number,
  height: number,
  fontCss: string,
  logo: string,
  scene: string,
  dashboard: string,
) {
  const format =
    post.platform === "x"
      ? "landscape"
      : post.platform === "snapchat"
        ? "story"
        : "portrait";
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>${fontCss}
    *{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;background:#1c1c1c;color:#ededed;font-family:Tajawal,sans-serif}body{overflow:hidden}
    .canvas{height:100%;width:100%;position:relative;padding:80px;display:flex;flex-direction:column;isolation:isolate;background:#1c1c1c;overflow:hidden}
    .canvas::after{content:"";position:absolute;inset:28px;border:1px solid #333;border-radius:6px;pointer-events:none;z-index:-1}
    .scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.85;z-index:-3}.veil{position:absolute;inset:0;background:linear-gradient(180deg,#1c1c1cf5 0%,#1c1c1cdb 24%,#1c1c1c55 58%,#1c1c1c99 82%,#1c1c1cf5 100%);z-index:-2}
    .masthead{display:flex;align-items:center;gap:25px;height:105px;flex-shrink:0}.logo{width:255px;height:auto;object-fit:contain}
    .body{flex:1;min-height:0;display:flex;flex-direction:column;gap:44px;padding-top:65px}.copy{flex-shrink:0}.eyebrow{font-size:28px;color:#3ecf8e;font-weight:500;margin:0 0 24px;display:flex;align-items:center;gap:12px}.eyebrow:before{content:"";width:23px;height:3px;background:#3ecf8e}
    h1{font-size:100px;line-height:1.28;letter-spacing:-2px;font-weight:800;white-space:pre-line;margin:0;max-width:100%;text-wrap:balance}.subline{font-size:34px;line-height:1.65;color:#c8c8c8;margin:25px 0 0;max-width:95%;font-weight:400}.graphic{flex:1;min-height:260px;display:flex;flex-direction:column;justify-content:center;gap:24px;padding-block:12px}
    .footer{border-top:1px solid #4a4a4a;padding-top:26px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-shrink:0}.cta{font-size:29px;font-weight:700;display:flex;align-items:center;gap:16px}.cta svg{color:#3ecf8e}.sign{font-size:21px;color:#b6b6b6;max-width:270px;line-height:1.6}
    .point{display:flex;align-items:center;gap:24px;min-width:0;background:#242424;border:1px solid #414141;border-radius:18px;padding:30px}.point-icon{display:flex;color:#3ecf8e;flex-shrink:0}.point>div{display:flex;flex-direction:column;gap:12px;min-width:0}.point strong{font-size:34px;line-height:1.5;font-weight:500}.micro{font-size:18px;color:#8f8f8f;direction:ltr;text-align:right}.flow{display:flex;flex-direction:column;gap:22px}.flow .point{position:relative}.flow .point:not(:last-child):after{content:"";position:absolute;right:55px;bottom:-23px;height:22px;border-right:1px solid #3ecf8e66}
    .brand-orbit{height:470px;position:relative;display:grid;place-items:center}.orbit-ring{position:absolute;border:1px solid #3ecf8e77;width:360px;height:360px;border-radius:50%;box-shadow:0 0 0 52px #3ecf8e07,0 0 0 105px #3ecf8e04}.orbit-center{display:grid;place-items:center;width:150px;height:150px;background:#193e2d;border:1px solid #3ecf8e;border-radius:40px;color:#3ecf8e;transform:rotate(-8deg)}.orbit-center svg{transform:rotate(8deg)}.orbit-tag{position:absolute;padding:20px 30px;font-size:30px;background:#242424ed;border:1px solid #4a5e53;border-radius:12px}.tag-0{top:20px;right:16%}.tag-1{bottom:58px;right:7%}.tag-2{bottom:58px;left:7%}
    .network{display:flex;flex-direction:column;align-items:center}.network-center{border:1px solid #3ecf8e;background:#20372d;border-radius:20px;display:flex;align-items:center;gap:24px;padding:25px 45px;font-size:32px;color:#3ecf8e}.network-line{width:65%;height:60px;border-bottom:1px solid #3ecf8e80;position:relative}.network-line:before{content:"";position:absolute;top:0;height:60px;right:50%;border-right:1px solid #3ecf8e80}.network-nodes{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;width:100%;padding-top:30px}.network-nodes .point{padding:26px 15px;flex-direction:column;gap:16px;text-align:center}.network-nodes .point strong{font-size:28px}.network-nodes .micro{text-align:center}
    .court-diagram{height:270px;position:relative;border:2px solid #3ecf8e;border-radius:16px;background:#3ecf8e0b;margin-bottom:10px}.court-diagram>span{position:absolute;inset:30px;border:1px solid #3ecf8e77}.court-diagram>i{position:absolute;inset:50% 30px auto;border-top:1px dashed #3ecf8e}.court-diagram>b{position:absolute;top:30px;bottom:30px;right:50%;border-right:1px solid #3ecf8e66}.court-diagram>div{position:absolute;right:calc(50% - 55px);top:calc(50% - 55px);background:#20372d;border:1px solid #3ecf8e;border-radius:22px;width:110px;height:110px;display:grid;place-items:center;color:#3ecf8e}.diagram-points{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.diagram-points .point{padding:20px 12px;flex-direction:column;text-align:center;gap:10px}.diagram-points .point strong{font-size:26px}.diagram-points .micro{text-align:center}
    .receipt{max-width:900px;width:100%;margin:auto;border:1px solid #505050;background:#242424;border-radius:22px;padding:32px}.receipt-heading{display:flex;gap:25px;align-items:center;color:#3ecf8e;font-size:30px;padding-bottom:24px;border-bottom:1px dashed #555}.receipt .point{background:none;border:none;border-radius:0;border-bottom:1px solid #393939;padding:23px 5px}.receipt .micro{display:none}.receipt-end{display:flex;justify-content:space-between;align-items:center;font-size:25px;color:#c1c1c1;padding-top:24px}.receipt-end svg{color:#3ecf8e}
    .checklist{display:flex;flex-direction:column;gap:25px}.check-row{border:1px solid #444;border-radius:16px;display:flex;align-items:center;gap:24px;padding:32px;background:#242424}.check-circle{display:grid;place-items:center;background:#3ecf8e14;color:#3ecf8e;border:1px solid #3ecf8e88;width:64px;height:64px;border-radius:50%;flex-shrink:0}.check-row strong{font-size:34px;font-weight:500}.check-row small{margin-inline-start:auto;font-size:23px;color:#888;direction:ltr}
    .stock{display:grid;grid-template-columns:1fr 2fr;align-items:center;gap:32px}.stock-symbol{border:1px solid #3ecf8e88;color:#3ecf8e;background:#20372d;display:grid;place-items:center;aspect-ratio:1;border-radius:25px;box-shadow:12px 12px 0 #292929,24px 24px 0 #333}.stock-points{display:flex;flex-direction:column;gap:20px}.stock-points .point{padding:22px}.stock-points .micro{display:none}
    .dashboard-frame{border:1px solid #484848;border-radius:18px;background:#202020;overflow:hidden}.frame-heading{display:flex;align-items:center;gap:12px;padding:20px 24px;font-size:23px;border-bottom:1px solid #444}.frame-heading>span:last-child{margin-inline-start:auto;font-size:18px;color:#aaa}.live-dot{width:10px;height:10px;background:#3ecf8e;border-radius:50%}.dashboard-frame>img{width:100%;height:400px;object-fit:cover;object-position:top;display:block}.mini-points{display:flex;flex-wrap:wrap;justify-content:space-around;gap:20px;font-size:28px;color:#c9c9c9;margin-top:12px}.mini-points>span{display:flex;align-items:center;gap:10px}.mini-points svg{color:#3ecf8e}
    [data-platform=facebook] .point{border-radius:6px;border-inline-start:3px solid #3ecf8e}[data-platform=facebook] h1{font-size:94px}[data-platform=facebook] .eyebrow{font-size:27px}
    [data-format=story]{padding:180px 72px 330px}[data-format=story]::after{inset:152px 28px 300px}[data-format=story] .masthead{height:78px}[data-format=story] .logo{width:220px}[data-format=story] .body{padding-top:60px;gap:32px}[data-format=story] h1{font-size:92px;line-height:1.3}[data-format=story] .eyebrow{font-size:26px;margin-bottom:22px}[data-format=story] .subline{font-size:32px;line-height:1.55}[data-format=story] .graphic{min-height:250px}[data-format=story] .point{padding:24px}[data-format=story] .point strong{font-size:30px}[data-format=story] .point-icon svg{width:40px;height:40px}[data-format=story] .footer{padding-top:24px}[data-format=story] .sign{font-size:19px;max-width:195px}[data-format=story] .cta{font-size:25px}[data-format=story] .brand-orbit{height:390px}[data-format=story] .orbit-ring{width:290px;height:290px}[data-format=story] .orbit-tag{font-size:26px;padding:15px 20px}[data-format=story] .network-nodes .point strong{font-size:23px}[data-format=story] .network-nodes .point{padding:22px 9px}[data-format=story] .dashboard-frame>img{height:300px}[data-format=story] .mini-points{font-size:23px}
    [data-format=landscape]{padding:30px 48px}[data-format=landscape]::after{inset:14px}[data-format=landscape] .masthead{height:58px}[data-format=landscape] .logo{width:165px}[data-format=landscape] .body{padding-top:26px;display:grid;grid-template-columns:1.05fr 1fr;gap:32px;align-items:center}[data-format=landscape] h1{font-size:53px;line-height:1.36;letter-spacing:-1px}[data-format=landscape] .eyebrow{font-size:17px;margin-bottom:17px}[data-format=landscape] .subline{font-size:22px;line-height:1.65;margin-top:17px}[data-format=landscape] .graphic{min-height:0;max-height:330px;gap:10px;padding:0}[data-format=landscape] .point{padding:14px 18px;gap:17px;border-radius:10px}[data-format=landscape] .point strong{font-size:23px}[data-format=landscape] .point-icon svg{width:30px;height:30px}[data-format=landscape] .micro{font-size:12px}[data-format=landscape] .point>div{gap:2px}[data-format=landscape] .flow{gap:12px}[data-format=landscape] .flow .point:after{height:12px;bottom:-13px;right:32px}[data-format=landscape] .footer{padding-top:17px}[data-format=landscape] .cta{font-size:20px}[data-format=landscape] .cta svg{width:23px;height:23px}[data-format=landscape] .sign{font-size:16px;max-width:none}[data-format=landscape] .brand-orbit{height:285px}[data-format=landscape] .orbit-ring{width:215px;height:215px;box-shadow:0 0 0 24px #3ecf8e06}[data-format=landscape] .orbit-center{width:95px;height:95px;border-radius:25px}[data-format=landscape] .orbit-center svg{width:50px;height:50px}[data-format=landscape] .orbit-tag{font-size:20px;padding:12px 17px}[data-format=landscape] .tag-0{top:0;right:15%}[data-format=landscape] .tag-1{bottom:9px;right:0}[data-format=landscape] .tag-2{bottom:9px;left:0}[data-format=landscape] .network-center{font-size:20px;padding:15px 22px;gap:14px}[data-format=landscape] .network-center svg{width:35px;height:35px}[data-format=landscape] .network-line{height:35px}[data-format=landscape] .network-line:before{height:35px}[data-format=landscape] .network-nodes{gap:8px;padding-top:17px}[data-format=landscape] .network-nodes .point{padding:14px 7px;gap:8px}[data-format=landscape] .network-nodes .point strong{font-size:18px}[data-format=landscape] .court-diagram{height:150px;margin:0}[data-format=landscape] .court-diagram>div{width:60px;height:60px;right:calc(50% - 30px);top:calc(50% - 30px);border-radius:14px}[data-format=landscape] .court-diagram svg{width:35px;height:35px}[data-format=landscape] .diagram-points{gap:8px}[data-format=landscape] .diagram-points .point{padding:12px 7px;gap:5px}[data-format=landscape] .diagram-points .point strong{font-size:17px}[data-format=landscape] .receipt{padding:18px;border-radius:12px}[data-format=landscape] .receipt-heading{font-size:20px;gap:15px;padding-bottom:12px}[data-format=landscape] .receipt-heading svg{width:29px;height:29px}[data-format=landscape] .receipt .point{padding:12px 0}[data-format=landscape] .receipt .point strong{font-size:20px}[data-format=landscape] .receipt-end{font-size:17px;padding-top:14px}[data-format=landscape] .checklist{gap:15px}[data-format=landscape] .check-row{padding:20px;gap:15px;border-radius:10px}[data-format=landscape] .check-circle{width:36px;height:36px}[data-format=landscape] .check-circle svg{width:23px;height:23px}[data-format=landscape] .check-row strong{font-size:23px}[data-format=landscape] .check-row small{font-size:16px}[data-format=landscape] .stock{gap:20px}[data-format=landscape] .stock-symbol{box-shadow:7px 7px 0 #292929,14px 14px 0 #333;border-radius:15px}[data-format=landscape] .stock-symbol svg{width:58px;height:58px}[data-format=landscape] .stock-points{gap:12px}[data-format=landscape] .stock-points .point{padding:16px}[data-format=landscape] .stock-points .point strong{font-size:20px}[data-format=landscape] .dashboard-frame{border-radius:10px}[data-format=landscape] .frame-heading{padding:10px 12px;font-size:14px;gap:7px}[data-format=landscape] .frame-heading>span:last-child{font-size:11px}[data-format=landscape] .dashboard-frame>img{height:220px}[data-format=landscape] .mini-points{font-size:17px;gap:7px}[data-format=landscape] .mini-points svg{width:19px;height:19px}
    [data-format=landscape] .veil{background:linear-gradient(270deg,#1c1c1cf5 0%,#1c1c1cdb 40%,#1c1c1c66 75%,#1c1c1c99 100%)}
    [data-scene=kitchen] .scene{object-position:60% center}[data-scene=inventory] .scene{object-position:45% center}
    [data-layout=product] .graphic{min-height:0;gap:24px;justify-content:stretch}[data-layout=product] .body{gap:28px;padding-top:40px}[data-layout=product] h1{font-size:90px}
    .product-frame{flex:1;min-height:0;position:relative;width:100%;background:#1c1c1cf0;border:1px solid #3ecf8e66;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px #0004}.product-frame>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center}
    .product-points{display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:27px;flex-shrink:0}.product-points>span{display:flex;align-items:center;gap:10px}.product-points svg{width:26px;height:26px;flex-shrink:0;color:#3ecf8e}
    [data-layout=product][data-format=story] h1{font-size:80px}[data-layout=product][data-format=story] .product-points{font-size:22px;gap:12px}[data-layout=product][data-format=story] .product-points svg{width:20px;height:20px}
    [data-layout=product][data-format=landscape] h1{font-size:50px}[data-layout=product][data-format=landscape] .body{padding-top:20px}[data-layout=product][data-format=landscape] .graphic{height:340px;max-height:340px;gap:15px}[data-layout=product][data-format=landscape] .product-points{font-size:16px;gap:10px}[data-layout=product][data-format=landscape] .product-points svg{width:17px;height:17px}.product-frame:has(img[src=""]){display:none}
  </style></head><body><article class="canvas" data-format="${format}" data-platform="${post.platform}" data-scene="${post.scene}" data-layout="${post.layout}">
  <img class="scene" src="${scene}" alt=""/><div class="veil"></div>
  <header class="masthead"><img class="logo" src="${logo}" alt="نرفد"/></header>
  <div class="body"><div class="copy"><p class="eyebrow">${escape(post.eyebrow)}</p><h1>${escape(post.headline)}</h1><p class="subline">${escape(post.subline)}</p></div><div class="graphic">${diagram(post, dashboard)}</div></div>
  <footer class="footer"><span class="cta">${escape(post.cta)} ${arrow}</span><span class="sign">نرفد مؤسستك بالتقنية.</span></footer></article></body></html>`;
}

async function main() {
  await mkdir(output, { recursive: true });
  const [fontCss, logoBuffer, sceneEntries, dashboardBuffer] =
    await Promise.all([
      fonts(),
      sharp(join(root, "public/logo.png")).trim().png().toBuffer(),
      Promise.all(
        Object.entries(socialScenes).map(
          async ([key, scene]) =>
            [
              key,
              uri(
                await readFile(
                  join(root, "content/marketing/source", scene.file),
                ),
              ),
            ] as const,
        ),
      ),
      readFile(join(root, "content/marketing/source/screens/overview.png")),
    ]);
  const logo = uri(logoBuffer),
    dashboard = uri(dashboardBuffer);
  const scenes = Object.fromEntries(sceneEntries);
  const screens = Object.fromEntries(
    await Promise.all(
      Object.entries(productScreens).flatMap(([key, screen]) =>
        ["wide", "focus"].map(async (style) => [
          `${key}-${style}`,
          uri(
            await readFile(
              join(
                root,
                "content/marketing/source/screens",
                `${screen.file}${style === "focus" ? ".focus" : ""}.png`,
              ),
            ),
          ),
        ]),
      ),
    ),
  );
  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  const manifest: {
    platform: string;
    file: string;
    width: number;
    height: number;
    bytes: number;
    sha256: string;
    scene: string;
    screenshot?: string;
  }[] = [];
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    for (const platform of socialPlatforms) {
      await mkdir(join(output, platform.id), { recursive: true });
      await page.setViewportSize({
        width: platform.width,
        height: platform.height,
      });
      for (const post of postsFor(platform.id)) {
        await page.setContent(
          html(
            post,
            platform.width,
            platform.height,
            fontCss,
            logo,
            scenes[post.scene],
            post.screenshot
              ? screens[`${post.screenshot}-${post.imageStyle ?? "wide"}`]
              : dashboard,
          ),
        );
        const visibleCopy = await page.locator("body").innerText();
        if (
          /\b(?:nerved|narfid)\b/i.test(visibleCopy) ||
          /مشهد تصوري|مشهد ورسم توضيحيان|رسم توضيحي للفكرة|واجهة ببيانات تجريبية/.test(
            visibleCopy,
          ) ||
          (await page.locator(".masthead").innerText()) !== ""
        )
          throw new Error(
            `${platform.id}/${post.id}: remove English branding and campaign numbering from the image.`,
          );
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(
            [400, 500, 700, 800].map((weight) =>
              document.fonts.load(
                `${weight} 80px Tajawal`,
                "نرفد مؤسستك بالتقنية",
              ),
            ),
          );
          await Promise.all(
            [...document.images].map((image) => image.decode()),
          );
        });
        const overflow = await page.evaluate(() => {
          const boundary = document
            .querySelector(".canvas")!
            .getBoundingClientRect();
          const maxBottom =
            boundary.bottom -
            (document.querySelector(".canvas")?.getAttribute("data-format") ===
            "story"
              ? 300
              : 14);
          return [
            ...document.querySelectorAll(".copy,.graphic,.footer,.masthead"),
          ]
            .filter(
              (element) =>
                element.getBoundingClientRect().bottom > maxBottom + 1 ||
                element.scrollWidth > element.clientWidth + 2,
            )
            .map((element) => element.className);
        });
        if (overflow.length)
          throw new Error(
            `${platform.id}/${post.id}: layout overflow: ${overflow.join(", ")}`,
          );
        const png = await page.screenshot({
          type: "png",
          animations: "disabled",
        });
        const file = postFilename(post);
        await writeFile(join(output, platform.id, file), png);
        await sharp(png)
          .resize({ width: 480 })
          .webp({ quality: 80 })
          .toFile(
            join(output, platform.id, file.replace(".png", ".preview.webp")),
          );
        await writeFile(
          join(output, platform.id, file.replace(".png", ".txt")),
          postText(post),
          "utf8",
        );
        manifest.push({
          platform: platform.id,
          file,
          width: platform.width,
          height: platform.height,
          bytes: png.length,
          sha256: createHash("sha256").update(png).digest("hex"),
          scene: post.scene,
          ...(post.screenshot
            ? { screenshot: `${post.screenshot}-${post.imageStyle ?? "wide"}` }
            : {}),
        });
        console.log(
          `Rendered ${platform.id}/${file} (${Math.round(png.length / 1024)} KB)`,
        );
      }
    }
  } finally {
    await browser.close();
  }
  await writeFile(
    join(output, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  // Optional local convenience copies, ignored by Git. Production streams these
  // bundles from the original files and does not need Python or prebuilt ZIPs.
  const zipScript = `import pathlib,zipfile,sys\nroot=pathlib.Path(sys.argv[1])\nplatforms=sys.argv[2:]\nfor name in platforms+['all']:\n files=sorted([p for s in (platforms if name=='all' else [name]) for p in (root/s).iterdir() if p.suffix in ['.png','.txt']])\n with zipfile.ZipFile(root/(name+'-posts.zip'),'w',zipfile.ZIP_DEFLATED) as z:\n  for p in files: z.write(p,str(p.relative_to(root)))\n with zipfile.ZipFile(root/(name+'-posts.zip'),'r') as z:\n  assert z.testzip() is None\nprint('Created and verified 5 ZIP archives')`;
  execFileSync(
    process.platform === "win32" ? "python" : "python3",
    [
      "-c",
      zipScript,
      output,
      ...socialPlatforms.map((platform) => platform.id),
    ],
    { stdio: "inherit" },
  );
  if (manifest.length !== 120 || socialPosts.length !== 120)
    throw new Error("Expected exactly 120 posts.");
  console.log(
    `Saved ${manifest.length} PNGs, previews and captions under ${basename(output)}; local ZIPs are ignored by Git.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
