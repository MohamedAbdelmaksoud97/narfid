"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  DoorOpen,
  FileCheck2,
  GitBranch,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Rule = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  summary: string;
  details: string[];
  example: string;
  icon: typeof BookOpenCheck;
  tags: string[];
};

const rules: Rule[] = [
  {
    id: "foundation",
    number: "01",
    title: "الفكرة التي تجمع كل شيء",
    shortTitle: "الصورة الكبيرة",
    summary: "كل عملية تمر عبر صلاحية واضحة، فرع صحيح، وقت مناسب، وحالة موثقة.",
    details: [
      "نرفد يجمع المؤسسة والفروع والأعضاء والاشتراكات والحجوزات والمالية في صورة واحدة.",
      "لا يسجل النظام نتيجة نهائية فقط؛ بل يحفظ السعر والضريبة والخصم والسياسة التي كانت سارية لحظة العملية.",
      "التاريخ مهم: التصحيح يضيف سجلًا جديدًا بدل محو ما حدث سابقًا.",
    ],
    example: "عند شراء باقة، يبدأ النظام بالتحقق من الصلاحية، ثم يصدر الفاتورة، وبعد اكتمال الدفع يفعّل الاشتراك ويرسل الإشعار.",
    icon: Sparkles,
    tags: ["الجميع", "مرجع أساسي"],
  },
  {
    id: "roles",
    number: "02",
    title: "كل شخص يرى الجزء الذي يحتاجه",
    shortTitle: "الأدوار والصلاحيات",
    summary: "الدور ليس اسمًا فقط؛ هو صلاحيات مرتبطة بالمؤسسة أو بفروع محددة.",
    details: [
      "موظف الاستقبال يدير الأعضاء والحضور والحجوزات بحسب الفرع المسموح له.",
      "مدير الفرع يتابع تشغيل فرعه، والمسؤول المالي يتعامل مع الدفع والاسترداد والمصروفات.",
      "العضو وولي الأمر يريان البيانات والعمليات التي تسمح بها العلاقة المسجلة فقط.",
    ],
    example: "موظف لديه قراءة أعضاء في الرياض لا يرى أعضاء جدة، حتى لو حاول إرسال طلب باسم فرع جدة.",
    icon: UsersRound,
    tags: ["المدير", "الاستقبال", "المالية"],
  },
  {
    id: "branches",
    number: "03",
    title: "الفرع جزء من القرار",
    shortTitle: "المؤسسة والفروع",
    summary: "فرع التسجيل، والبيع، والوصول، والحضور أشياء مختلفة لكل منها معنى واضح.",
    details: [
      "كل فرع يتبع مؤسسة واحدة وله حالة ومنطقة زمنية وساعات عمل اختيارية.",
      "تسجيل العضو في فرع لا يمنحه دخولًا تلقائيًا إلى كل الفروع.",
      "يحسب يوم العمل حسب توقيت الفرع، لذلك قد يختلف تاريخ الحدث المحلي عن التاريخ العالمي.",
    ],
    example: "قد يكون العضو مسجلًا في فرع الرياض، لكنه يدخل فرعًا آخر فقط إذا كانت باقته تسمح بذلك.",
    icon: GitBranch,
    tags: ["الفروع", "الحضور"],
  },
  {
    id: "member",
    number: "04",
    title: "ملف العضو مستقل عن حساب الدخول",
    shortTitle: "العضو والأسرة",
    summary: "يمكن أن يوجد عضو بلا هاتف أو حساب، ويمكن لولي الأمر إدارة أكثر من طفل بصلاحيات محددة.",
    details: [
      "للعضو رقم عضوية وبيانات أساسية وفرع تسجيل وجهات اتصال وحالة تشغيلية.",
      "يُحفظ الهاتف والبريد بصيغة موحدة وتُمنع التكرارات، مع جهة أساسية واحدة من كل نوع.",
      "الحظر يسبق فحص الاشتراك ويوقف الدخول مع الاحتفاظ بسبب الحظر وتاريخه.",
    ],
    example: "وجود اشتراك نشط لا يكفي لدخول عضو محظور؛ يوقف النظام المحاولة أولًا بسبب الحظر.",
    icon: ShieldCheck,
    tags: ["الأعضاء", "ولي الأمر"],
  },
  {
    id: "subscriptions",
    number: "05",
    title: "الاشتراك رحلة لها حالات",
    shortTitle: "الاشتراكات والحضور",
    summary: "من الشراء إلى التفعيل والتجميد والتجديد، لكل خطوة شرط واضح ونتيجة قابلة للتتبع.",
    details: [
      "يحفظ الاشتراك تفاصيل الباقة والسعر والخصم والضريبة وفروع الوصول والسياسات وقت التعاقد.",
      "التجميد قد يكون فوريًا أو مجدولًا، ويخضع لحدود المدة وعدد المرات وسياسة الباقة.",
      "التجديد يحافظ على المدة المتفق عليها، والإلغاء يحسب أثره قبل اعتماده عندما يلزم.",
    ],
    example: "إذا بدأ التجميد غدًا، يبقى الاشتراك فعالًا اليوم وتبدأ المدة الجديدة عند الموعد المجدول.",
    icon: Clock3,
    tags: ["الاشتراكات", "التجميد", "التجديد"],
  },
  {
    id: "commerce",
    number: "06",
    title: "المال يتحرك بسجل واضح",
    shortTitle: "البيع والمالية",
    summary: "الطلب والفاتورة والدفع والاسترداد مراحل منفصلة تحمي الدقة وتمنع احتساب المبلغ مرتين.",
    details: [
      "تُنشأ الفاتورة من تفاصيل الطلب، ويظهر فيها السعر والخصم والضريبة والعقود المرتبطة.",
      "لا يصبح الاشتراك فعالًا لمجرد إنشاء الطلب؛ اكتمال الدفع هو نقطة التفعيل.",
      "تصحيح حركة مالية يتم بالإلغاء ثم التسجيل الصحيح، حتى يبقى الأثر المالي مفهومًا.",
    ],
    example: "دفعة عقد مسجلة تظهر تلقائيًا في التحصيلات؛ لذلك لا نضيف تحصيلًا إضافيًا لنفس الدفعة.",
    icon: WalletCards,
    tags: ["الفواتير", "الدفع", "الاسترداد"],
  },
  {
    id: "operations",
    number: "07",
    title: "التشغيل اليومي له إيقاعه",
    shortTitle: "الحجوزات والتشغيل",
    summary: "المرافق والمطعم والتدريب والموظفون يتحركون حسب الوقت والسعة والحالة.",
    details: [
      "لا يسمح النظام بتداخل مناوبات الموظف أو حجز يتجاوز السعة أو يتعارض مع سياسة الإلغاء.",
      "تتدرج طلبات المطعم من قائمة اليوم إلى التحضير ثم حالة الطلب، مع ضبط المخزون عند الحاجة.",
      "التدريب يحفظ التعيين والجدول والخطة والقياسات والعمولات ضمن سجل قابل للمراجعة.",
    ],
    example: "إذا امتلأت الحصة، لا يكفي أن يضغط الموظف زر الحجز؛ يجب أن تتوفر سعة وأن يسمح الوقت والسياسة.",
    icon: BriefcaseBusiness,
    tags: ["الموظفون", "المطعم", "التدريب"],
  },
  {
    id: "trust",
    number: "08",
    title: "الثقة تأتي من التحقق والمتابعة",
    shortTitle: "الأمان والتقارير",
    summary: "النظام يعيد فحص الطلبات الحساسة، ويرسل الإشعارات، ويبني التقارير من سجلات يمكن مراجعتها.",
    details: [
      "العمليات الحساسة مثل تعديل الهوية أو تصحيح الدفع تحتاج مستوى أمان أعلى من مجرد تسجيل الدخول.",
      "الملفات المقبولة محددة النوع والحجم، والحسابات المحذوفة تمر بطلب متابعة بدل حذف مفاجئ للبيانات التشغيلية.",
      "التقارير والاستيراد يحافظان على الفرق بين السجل التاريخي القديم والاشتراك التشغيلي الحالي.",
    ],
    example: "إخفاء زر في الواجهة لا يمنح الصلاحية؛ الخادم يعيد الفحص في كل طلب.",
    icon: FileCheck2,
    tags: ["الأمان", "التقارير", "الإشعارات"],
  },
];

const roles = [
  { label: "كل الفريق", value: "all" },
  { label: "الاستقبال والكاشير", value: "الاستقبال" },
  { label: "مدير الفرع", value: "المدير" },
  { label: "المالية", value: "المالية" },
  { label: "العضو وولي الأمر", value: "الأعضاء" },
] as const;

const journey = [
  { label: "يبدأ الطلب", text: "يحدد الشخص والفرع والعملية التي يريد تنفيذها.", icon: UsersRound },
  { label: "يتحقق النظام", text: "يفحص الصلاحية والحالة والوقت والسعة والسياسة.", icon: LockKeyhole },
  { label: "يُحفظ القرار", text: "تُسجل التفاصيل التي تشرح لماذا قُبلت العملية أو رُفضت.", icon: FileCheck2 },
  { label: "تتحرك الخدمة", text: "تتغير حالة الاشتراك أو الحجز أو الطلب إلى الخطوة التالية.", icon: DoorOpen },
  { label: "يصل الأثر", text: "يظهر الإشعار والتقرير والسجل لكل من يملك صلاحية المتابعة.", icon: BadgeCheck },
];

function RuleCard({ rule, expanded, onToggle }: { rule: Rule; expanded: boolean; onToggle: () => void }) {
  const Icon = rule.icon;
  return (
    <Card className={`business-rule-card ${expanded ? "is-expanded" : ""}`}>
      <button className="business-rule-trigger" onClick={onToggle} aria-expanded={expanded}>
        <span className="business-rule-icon"><Icon aria-hidden="true" /></span>
        <span className="business-rule-trigger-copy">
          <span className="business-rule-number" dir="ltr">{rule.number}</span>
          <span className="business-rule-title">{rule.title}</span>
          <span className="business-rule-summary">{rule.summary}</span>
        </span>
        <ChevronDown className="business-rule-chevron" aria-hidden="true" />
      </button>
      {expanded && (
        <CardContent className="business-rule-detail">
          <div className="business-rule-points">
            {rule.details.map((detail) => <p key={detail}><Check aria-hidden="true" />{detail}</p>)}
          </div>
          <div className="business-rule-example">
            <span><CircleHelp aria-hidden="true" /> مثال من الواقع</span>
            <p>{rule.example}</p>
          </div>
          <div className="business-rule-tags">
            {rule.tags.map((tag) => <Badge variant="secondary" key={tag}>{tag}</Badge>)}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function BusinessRulesGuide({ sourceText }: { sourceText: string }) {
  const [activeRule, setActiveRule] = useState("foundation");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("all");
  const [branch, setBranch] = useState("same");
  const [subscription, setSubscription] = useState("active");
  const [blocked, setBlocked] = useState(false);

  const visibleRules = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rules.filter((rule) => {
      const matchesQuery = !normalized || [rule.title, rule.summary, rule.example, ...rule.details, ...rule.tags].join(" ").toLowerCase().includes(normalized);
      const matchesRole = role === "all" || rule.tags.includes(role);
      return matchesQuery && matchesRole;
    });
  }, [query, role]);

  const sourceSections = useMemo(() => {
    const sections: Array<{ title: string; body: string }> = [];
    let current: { title: string; body: string[] } | null = null;
    for (const line of sourceText.split(/\r?\n/)) {
      const heading = line.match(/^#{1,3}\s+(.+)$/);
      if (heading) {
        if (current) sections.push({ title: current.title, body: current.body.join("\n").trim() });
        current = { title: heading[1].trim(), body: [] };
      } else if (current) {
        current.body.push(line);
      }
    }
    if (current) sections.push({ title: current.title, body: current.body.join("\n").trim() });
    return sections.filter((section) => section.title && section.body);
  }, [sourceText]);

  const decision = blocked
    ? { tone: "blocked", title: "النتيجة: الدخول مرفوض", text: "الحظر يسبق فحص الاشتراك، لذلك لا يمر العضو حتى لو كانت بقته نشطة." }
    : branch === "different"
      ? { tone: "review", title: "النتيجة: نحتاج مراجعة الوصول", text: "فرع التسجيل وحده لا يكفي. يجب أن تسمح الباقة بالوصول إلى هذا الفرع." }
      : subscription === "active"
        ? { tone: "allowed", title: "النتيجة: يمكن السماح بالدخول", text: "العضو غير محظور، والفرع مطابق، والاشتراك نشط. يسجل النظام محاولة الحضور." }
        : subscription === "frozen"
          ? { tone: "review", title: "النتيجة: الدخول متوقف مؤقتًا", text: "الاشتراك مجمد الآن، لذلك ينتظر النظام تاريخ الاستئناف قبل السماح بالدخول." }
          : { tone: "blocked", title: "النتيجة: الاشتراك منتهٍ", text: "انتهاء الاشتراك يمنع الدخول حتى يتم التجديد أو إنشاء اشتراك جديد." };

  return (
    <main className="board-workspace business-rules-page" dir="rtl">
      <div className="container">
        <header className="business-rules-hero">
          <div className="business-rules-hero-copy">
            <div className="business-rules-meta">
              <Badge variant="secondary"><BookOpenCheck aria-hidden="true" /> دليل التشغيل</Badge>
              <span>مبني على BUSINESS_LOGIC.md</span>
            </div>
            <p className="section-kicker"><span className="status-dot" /> قواعد نظام نرفد</p>
            <h1>افهم القرار قبل أن تنفّذه.</h1>
            <p className="business-rules-lead">دليل بصري يشرح كيف يعمل نرفد خلف الكواليس: من يملك الصلاحية، ما الذي يتحقق منه النظام، ومتى تتحول العملية إلى نتيجة واضحة.</p>
            <div className="business-rules-hero-actions">
              <a className="business-rules-jump" href="#business-rules-index">ابدأ الاستكشاف <ArrowUpLeft aria-hidden="true" /></a>
              <span><ShieldCheck aria-hidden="true" /> مصمم للقراءة السريعة واتخاذ القرار</span>
            </div>
          </div>
          <div className="business-rules-hero-mark" aria-hidden="true">
            <div className="business-rules-orbit orbit-one" />
            <div className="business-rules-orbit orbit-two" />
            <BookOpenCheck />
            <span>28<br /><small>محورًا موثقًا</small></span>
          </div>
        </header>

        <section className="business-rules-stats" aria-label="ملخص الدليل">
          <Card><CardContent><span>28</span><p>محورًا في الملف الأصلي</p></CardContent></Card>
          <Card><CardContent><span>08</span><p>مسارات مفهومة للفريق</p></CardContent></Card>
          <Card><CardContent><span>04</span><p>فحوصات تسبق القرار</p></CardContent></Card>
          <Card><CardContent><span>01</span><p>مرجع مشترك للجميع</p></CardContent></Card>
        </section>

        <section className="business-rules-principles" aria-label="المبادئ الأربعة">
          <div><LockKeyhole aria-hidden="true" /><strong>صلاحية</strong><span>من يطلب؟</span></div>
          <div><GitBranch aria-hidden="true" /><strong>فرع</strong><span>أين يحدث؟</span></div>
          <div><Clock3 aria-hidden="true" /><strong>وقت</strong><span>متى يحدث؟</span></div>
          <div><FileCheck2 aria-hidden="true" /><strong>حالة</strong><span>ما النتيجة؟</span></div>
        </section>

        <section className="business-rules-journey" aria-labelledby="journey-heading">
          <div className="business-section-heading">
            <span className="section-kicker">كيف يفكر النظام؟</span>
            <h2 id="journey-heading">من الطلب إلى الأثر، في خمس حركات.</h2>
            <p>كل عملية في نرفد تتبع إيقاعًا مشابهًا، لذلك يستطيع الفريق فهم ما حدث وماذا يأتي بعده.</p>
          </div>
          <div className="business-journey-track">
            {journey.map((step, index) => {
              const Icon = step.icon;
              return <div className="business-journey-step" key={step.label}><span className="business-journey-index" dir="ltr">0{index + 1}</span><span className="business-journey-icon"><Icon aria-hidden="true" /></span><strong>{step.label}</strong><p>{step.text}</p>{index < journey.length - 1 && <ArrowLeft className="business-journey-arrow" aria-hidden="true" />}</div>;
            })}
          </div>
        </section>

        <section id="business-rules-index" className="business-rules-explorer" aria-labelledby="rules-heading">
          <aside className="business-rules-sidebar">
            <div className="business-sticky-panel">
              <span className="section-kicker">استكشف الدليل</span>
              <h2>اختر ما يهمك الآن</h2>
              <div className="business-role-list" role="list">
                {roles.map((item) => <button key={item.value} className={role === item.value ? "is-active" : ""} onClick={() => setRole(item.value)}>{item.label}{role === item.value && <Check aria-hidden="true" />}</button>)}
              </div>
              <div className="business-rules-note"><CircleHelp aria-hidden="true" /><p>يمكنك البحث بكلمة مثل «تجميد» أو «فرع» أو «فاتورة» للوصول إلى القاعدة بسرعة.</p></div>
            </div>
          </aside>
          <div className="business-rules-content">
            <div className="business-section-heading business-rules-content-heading">
              <span className="section-kicker">المرجع العملي</span>
              <h2 id="rules-heading">القواعد التي تحرك يوم العمل.</h2>
              <p>افتح البطاقة لتقرأ الشرح والمثال التشغيلي بلغة الفريق اليومية.</p>
            </div>
            <label className="business-rules-search"><Search aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في القواعد…" aria-label="ابحث في قواعد النظام" /></label>
            <div className="business-rule-list">
              {visibleRules.length ? visibleRules.map((rule) => <RuleCard key={rule.id} rule={rule} expanded={activeRule === rule.id} onToggle={() => setActiveRule(activeRule === rule.id ? "" : rule.id)} />) : <Card className="business-empty-state"><CardContent><Search aria-hidden="true" /><strong>لا توجد قاعدة بهذه الكلمات</strong><p>جرّب كلمة أقصر أو أعد اختيار «كل الفريق».</p></CardContent></Card>}
            </div>
          </div>
        </section>

        <section className="business-decision-lab" aria-labelledby="decision-heading">
          <div className="business-decision-copy">
            <span className="section-kicker"><Sparkles aria-hidden="true" /> جرّب القرار</span>
            <h2 id="decision-heading">هل يُسمح للعضو بالدخول؟</h2>
            <p>غيّر المعطيات وشاهد كيف يرتب النظام أولوياته. هذه محاكاة تعليمية مبسطة لقاعدة الحضور في الملف.</p>
            <div className="business-decision-form">
              <fieldset><legend>هل العضو محظور؟</legend><div className="business-choice-row"><button className={!blocked ? "is-selected" : ""} onClick={() => setBlocked(false)}>لا</button><button className={blocked ? "is-selected" : ""} onClick={() => setBlocked(true)}>نعم</button></div></fieldset>
              <fieldset><legend>حالة الاشتراك</legend><div className="business-choice-row business-choice-three">{[["active", "نشط"], ["frozen", "مجمد"], ["expired", "منتهٍ"]].map(([value, label]) => <button key={value} className={subscription === value ? "is-selected" : ""} onClick={() => setSubscription(value)}>{label}</button>)}</div></fieldset>
              <fieldset><legend>الفرع المطلوب</legend><div className="business-choice-row"><button className={branch === "same" ? "is-selected" : ""} onClick={() => setBranch("same")}>مسموح في الباقة</button><button className={branch === "different" ? "is-selected" : ""} onClick={() => setBranch("different")}>فرع آخر</button></div></fieldset>
            </div>
          </div>
          <Card className={`business-decision-result is-${decision.tone}`}>
            <CardHeader><div className="business-decision-result-icon">{decision.tone === "allowed" ? <Check aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}</div><CardDescription>قرار النظام</CardDescription><CardTitle>{decision.title}</CardTitle></CardHeader>
            <CardContent><p>{decision.text}</p><div className="business-decision-checks"><span><Check aria-hidden="true" /> فحص الحظر</span><span><Check aria-hidden="true" /> فحص الفرع</span><span><Check aria-hidden="true" /> فحص الحالة</span></div></CardContent>
          </Card>
        </section>

        <section className="business-full-reference" aria-labelledby="full-reference-heading">
          <div className="business-section-heading">
            <span className="section-kicker"><BookOpenCheck aria-hidden="true" /> المحتوى الكامل</span>
            <h2 id="full-reference-heading">كل قواعد الملف، مرتبة لتعود إليها وقت الحاجة.</h2>
            <p>الشرح أعلاه يسهّل البداية، وهذا الفهرس يحافظ على التفاصيل والاستثناءات الواردة في `BUSINESS_LOGIC.md`. افتح أي محور لقراءة نصه كاملًا.</p>
          </div>
          <div className="business-source-list">
            {sourceSections.map((section, index) => (
              <details key={`${section.title}-${index}`} className="business-source-section" open={index === 0}>
                <summary><span dir="ltr">{String(index + 1).padStart(2, "0")}</span><strong>{section.title}</strong><ChevronDown aria-hidden="true" /></summary>
                <div className="business-source-body">{section.body.split(/\n\s*\n/).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>
              </details>
            ))}
          </div>
        </section>

        <footer className="business-rules-footer"><span><BookOpenCheck aria-hidden="true" /> قواعد نظام نرفد</span><span>مرجع مبسط للفريق · راجع BUSINESS_LOGIC.md للتفاصيل الكاملة</span><Button variant="ghost" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>العودة للبداية <ArrowUpLeft data-icon="inline-end" /></Button></footer>
      </div>
    </main>
  );
}
