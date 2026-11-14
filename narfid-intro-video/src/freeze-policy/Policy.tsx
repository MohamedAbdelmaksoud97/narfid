import { interpolate, useCurrentFrame } from "remotion";
import { clamp, Cue, Reveal, Screen, Stage } from "./Stage";

const maximum = { label: 14, value: 22 };
const occurrences = { label: 50, value: 58 };
const activity = { label: 86, value: 94 };
const completed = 107;
const balance = { label: 134, value: 142 };

const Metric = ({
  label,
  value,
  timing,
  children,
}: {
  label: string;
  value: string;
  timing: { label: number; value: number };
  children?: React.ReactNode;
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      className="freeze-policy-metric"
      style={{
        opacity: interpolate(
          frame,
          [timing.label - 5, timing.label],
          [0, 1],
          clamp,
        ),
      }}
    >
      <Reveal
        className="freeze-metric-label"
        at={timing.label}
        frames={5}
        axis="x"
      >
        {label}
      </Reveal>
      <Reveal className="freeze-metric-value" at={timing.value} frames={8}>
        {value}
      </Reveal>
      {children}
    </div>
  );
};

export const FreezePolicy = () => (
  <Stage>
    <div className="freeze-policy-header">
      <div className="freeze-kicker">الشروط المحفوظة مع الاشتراك</div>
      <Reveal className="freeze-title" at={0}>
        سياسة الباقة <small>مثال</small>
      </Reveal>
    </div>
    <Screen file="policy" className="freeze-policy-screen" />
    <div className="freeze-policy-grid">
      <Metric label="أقصى مدة للمرة" value="٧ أيام" timing={maximum} />
      <Metric label="المرات المتبقية" value="٢ من ٢" timing={occurrences} />
      <Metric label="الحد الأدنى للنشاط" value="١٤ يومًا" timing={activity}>
        <Reveal className="freeze-metric-note" at={completed}>
          أكمل العضو ٣٠ يومًا ✓
        </Reveal>
      </Metric>
      <Metric label="رصيد التجميد" value="١٢ يومًا" timing={balance} />
    </div>
    <Cue at={0} effect="felt" name="فتح السياسة" />
    <Cue at={maximum.label} effect="wood" name="الحد الأقصى" />
    <Cue at={maximum.value} effect="rubber" name="سبعة أيام" />
    <Cue at={occurrences.label} effect="wood-soft" name="المرات المتبقية" />
    <Cue at={occurrences.value} effect="rubber" name="مرتان" gain={0.84} />
    <Cue
      at={activity.label}
      effect="wood"
      name="الحد الأدنى للنشاط"
      gain={0.88}
    />
    <Cue at={activity.value} effect="rubber" name="أربعة عشر يومًا" />
    <Cue at={completed} effect="key" name="تحقق شرط النشاط" />
    <Cue at={balance.label} effect="wood-soft" name="رصيد التجميد" />
    <Cue at={balance.value} effect="rubber" name="اثنا عشر يومًا" gain={1.12} />
  </Stage>
);
