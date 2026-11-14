import { interpolate, useCurrentFrame } from "remotion";
import { clamp, Cue, Cursor, Reveal, Screen, Stage, Underline } from "./Stage";

const hook = 4;
const date = 21;
const buttonEntrance = 40;
const press = 60;
const rewindFirst = 64;
const rewindSecond = 67;
const returned = 70;
const active = 82;
const extension = 106;
const end = 131;
const balance = 163;
const debit = 179;
const remaining = 194;
const underlineActual = 232;
const underlineRequested = 256;

export const FreezeResume = () => {
  const frame = useCurrentFrame();
  const right = interpolate(
    frame,
    [press, rewindFirst, rewindSecond, returned],
    [100, (6 / 7) * 100, (5 / 7) * 100, (4 / 7) * 100],
    clamp,
  );
  return (
    <Stage>
      <div className="freeze-resume-header">
        <Reveal className="freeze-title" at={hook} axis="x">
          رجع العضو بدري
        </Reveal>
        <Reveal className="freeze-kicker" at={date}>
          ١٤ ديسمبر
        </Reveal>
      </div>
      <div className="freeze-return-track">
        <div className="freeze-calendar-track" />
        <div className="freeze-calendar-range" style={{ width: `${right}%` }} />
        <div className="freeze-return-tick" style={{ right: `${right}%` }} />
        <span className="freeze-return-old">١٧ ديسمبر</span>
      </div>
      <Screen
        file="resume"
        className="freeze-resume-screen"
        style={{
          opacity: interpolate(
            frame,
            [date, date + 8, active, active + 10],
            [0, 1, 1, 0],
            clamp,
          ),
        }}
      />
      {frame < returned && (
        <Reveal className="freeze-resume-action" at={buttonEntrance} axis="x">
          <span
            className="freeze-action"
            style={{ translate: frame === press ? "0 2px" : "0 0" }}
          >
            استئناف الاشتراك
          </span>
        </Reveal>
      )}
      <Cursor from={43} at={press} x={26} y={76} />
      <Reveal className="freeze-active" at={active}>
        <span className="freeze-status">نشط</span>
      </Reveal>
      <div className="freeze-outcomes">
        <div
          className="freeze-outcome freeze-outcome-end"
          style={{
            opacity: interpolate(
              frame,
              [extension - 6, extension],
              [0, 1],
              clamp,
            ),
          }}
        >
          <Reveal className="freeze-outcome-label" at={extension} axis="x">
            تمديد الاشتراك
          </Reveal>
          <Reveal className="freeze-outcome-number" at={extension} frames={8}>
            <span>
              ٤ أيام فعلية
              <Underline at={underlineActual} color="#66e3a6" />
            </span>
          </Reveal>
          <Reveal className="freeze-outcome-note" at={end} axis="x">
            النهاية الجديدة · <strong>٤ يناير</strong>
          </Reveal>
        </div>
        <div
          className="freeze-outcome freeze-outcome-balance"
          style={{
            opacity: interpolate(frame, [balance - 6, balance], [0, 1], clamp),
          }}
        >
          <Reveal className="freeze-outcome-label" at={balance} axis="x">
            رصيد التجميد
          </Reveal>
          <Reveal className="freeze-outcome-number" at={debit} frames={8}>
            <span>
              خصم ٧ أيام مطلوبة
              <Underline at={underlineRequested} color="#9bcbfb" />
            </span>
          </Reveal>
          <Reveal className="freeze-outcome-note" at={remaining} axis="x">
            <strong>٥ أيام متبقية</strong> من أصل ١٢
          </Reveal>
        </div>
      </div>
      <Cue at={hook} effect="felt" name="عودة مبكرة" />
      <Cue at={date} effect="date" name="تاريخ العودة الفعلي" />
      <Cue at={buttonEntrance} effect="wood" name="ظهور زر الاستئناف" />
      <Cue at={press} effect="button" name="الضغط على الاستئناف" gain={0.82} />
      <Cue
        at={rewindFirst}
        effect="tooth"
        name="تراجع الموعد · العلامة الأولى"
        gain={0.76}
      />
      <Cue
        at={rewindSecond}
        effect="tooth"
        name="تراجع الموعد · العلامة الثانية"
        gain={0.9}
      />
      <Cue at={returned} effect="release" name="تحرير حالة التجميد" />
      <Cue at={active} effect="rubber" name="عودة الحالة إلى نشط" />
      <Cue at={extension} effect="saved" name="التمديد الفعلي" gain={0.83} />
      <Cue at={end} effect="snap" name="النهاية بعد الاستئناف" />
      <Cue at={balance} effect="wood-soft" name="عنوان رصيد التجميد" />
      <Cue at={debit} effect="counter" name="الأيام المطلوبة المخصومة" />
      <Cue at={remaining} effect="saved" name="رصيد الأيام المتبقي" />
      <Cue at={underlineActual} effect="pencil" name="إبراز الأيام الفعلية" />
      <Cue
        at={underlineRequested}
        effect="pencil"
        name="إبراز الأيام المطلوبة"
        gain={0.75}
      />
    </Stage>
  );
};
