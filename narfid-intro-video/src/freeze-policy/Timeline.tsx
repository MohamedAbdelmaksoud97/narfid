import { interpolate, useCurrentFrame } from "remotion";
import { clamp, Cue, Reveal, Stage } from "./Stage";

const firstTick = 4;
const secondTick = 10;
const start = 16;
const lock = 30;
const intervalMarks = [38, 42, 46, 50];
const plannedReturn = 54;
const endLabel = 83;
const extension = 95;

export const FreezeTimeline = () => {
  const frame = useCurrentFrame();
  return (
    <Stage cold={frame >= lock}>
      <div className="freeze-timeline-header">
        <Reveal className="freeze-kicker" at={firstTick}>
          ١٠ ديسمبر · ٩ صباحًا
        </Reveal>
        <Reveal className="freeze-title" at={start} axis="x">
          بدأ التجميد
        </Reveal>
        <div
          className={`freeze-status ${frame >= lock ? "freeze-status-cold" : ""}`}
        >
          {frame < lock ? "نشط" : <Reveal at={lock}>مجمّد</Reveal>}
        </div>
      </div>
      <div className="freeze-calendar">
        <div className="freeze-calendar-track" />
        <div
          className="freeze-calendar-range"
          style={{
            width: `${interpolate(frame, [lock, plannedReturn], [0, 100], clamp)}%`,
          }}
        />
        <div className="freeze-calendar-ticks">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
            <i key={day} />
          ))}
        </div>
        {intervalMarks.map((mark) => (
          <div
            key={mark}
            className="freeze-mark-pulse"
            style={{
              right: `${((mark - lock) / (plannedReturn - lock)) * 100}%`,
              opacity: interpolate(
                frame,
                [mark - 1, mark, mark + 7],
                [0, 1, 0],
                clamp,
              ),
              scale: interpolate(frame, [mark, mark + 8], [0.65, 1.3], clamp),
            }}
          />
        ))}
        <div
          className="freeze-calendar-playhead"
          style={{
            right: `${interpolate(frame, [0, firstTick, secondTick, start], [25, 19, 10, 0], clamp)}%`,
            opacity: interpolate(
              frame,
              [0, firstTick, start, start + 7],
              [0, 1, 1, 0],
              clamp,
            ),
          }}
        />
        <div className="freeze-calendar-start">
          <span />{" "}
          <Reveal at={start}>
            ١٠ ديسمبر <small>بدء التجميد</small>
          </Reveal>
        </div>
        <div
          className="freeze-calendar-end"
          style={{ opacity: frame >= plannedReturn - 6 ? 1 : 0 }}
        >
          <span />{" "}
          <Reveal at={plannedReturn}>
            ١٧ ديسمبر <small>العودة المخططة</small>
          </Reveal>
        </div>
      </div>
      <div className="freeze-term-row">
        <Reveal className="freeze-term-label" at={endLabel} axis="x">
          نهاية الاشتراك
        </Reveal>
        <Reveal className="freeze-previous-date" at={endLabel} axis="x">
          ٣١ ديسمبر
        </Reveal>
        <Reveal className="freeze-term-arrow" at={extension}>
          ←
        </Reveal>
        <Reveal className="freeze-new-date" at={extension}>
          ٧ يناير
        </Reveal>
        <Reveal className="freeze-days-chip" at={extension} axis="x">
          تمديد ٧ أيام
        </Reveal>
      </div>
      <Cue
        at={firstTick}
        effect="tooth"
        name="علامة التقويم الأولى"
        gain={0.6}
      />
      <Cue
        at={secondTick}
        effect="tooth"
        name="علامة التقويم الثانية"
        gain={0.82}
      />
      <Cue at={start} effect="date" name="الوصول إلى بداية التجميد" />
      <Cue at={lock} effect="lock" name="تحوّل الاشتراك إلى مجمّد" />
      <Cue
        at={intervalMarks[0]}
        effect="tooth"
        name="تمدد النطاق · أول علامة"
        gain={0.75}
      />
      <Cue
        at={intervalMarks[1]}
        effect="tooth"
        name="تمدد النطاق · ثاني علامة"
        gain={0.65}
      />
      <Cue
        at={intervalMarks[2]}
        effect="tooth"
        name="تمدد النطاق · ثالث علامة"
        gain={0.85}
      />
      <Cue
        at={intervalMarks[3]}
        effect="tooth"
        name="تمدد النطاق · آخر علامة"
        gain={0.75}
      />
      <Cue at={plannedReturn} effect="date" name="العودة المخططة" gain={0.84} />
      <Cue at={endLabel} effect="wood-soft" name="عنوان نهاية الاشتراك" />
      <Cue at={extension} effect="snap" name="النهاية عند بدء التجميد" />
    </Stage>
  );
};
