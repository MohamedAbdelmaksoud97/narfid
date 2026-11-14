import { interpolate, useCurrentFrame } from "remotion";
import { clamp, Cue, Cursor, Reveal, Screen, Stage } from "./Stage";

const select = 21;
const date = 40;
const time = 50;
const duration = 61;
const reason = 72;
const saveEntrance = 83;
const save = 99;
const saved = 111;
const status = 128;

export const FreezeSchedule = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div className="freeze-two-column freeze-schedule-layout">
        <div className="freeze-schedule-copy">
          <Reveal className="freeze-title" at={0}>
            متى يبدأ التجميد؟
          </Reveal>
          <div className="freeze-options">
            <strong>ابدأ الآن</strong>
            <strong className={frame >= select ? "freeze-selected" : undefined}>
              جدولة لموعد لاحق
            </strong>
          </div>
          <div className="freeze-schedule-values">
            <Reveal className="freeze-big-date" at={date} axis="x">
              ١٠ ديسمبر
            </Reveal>
            <Reveal className="freeze-time" at={time}>
              <bdi>٩:٠٠</bdi> ص
            </Reveal>
            <Reveal className="freeze-duration" at={duration}>
              ٧ أيام
            </Reveal>
            <Reveal className="freeze-reason" at={reason}>
              السبب · سفر
            </Reveal>
          </div>
          <div className="freeze-schedule-result">
            {frame < saved && (
              <Reveal at={saveEntrance} axis="x">
                <span
                  className="freeze-action"
                  style={{ translate: frame === save ? "0 2px" : "0 0" }}
                >
                  حفظ الجدولة
                </span>
              </Reveal>
            )}
            <Reveal className="freeze-confirmed" at={saved} axis="x">
              تمت جدولة التجميد ✓
            </Reveal>
            <Reveal className="freeze-result-note" at={status}>
              <strong>نشط</strong> · نهاية الاشتراك ٣١ ديسمبر
            </Reveal>
          </div>
        </div>
        <div className="freeze-schedule-shots">
          <Screen
            file="schedule"
            className="freeze-schedule-screen"
            style={{
              opacity: interpolate(
                frame,
                [0, select, select + 6, saved - 1, saved + 6],
                [0.36, 0.36, 1, 1, 0],
                clamp,
              ),
            }}
          />
          <Screen
            file="scheduled"
            className="freeze-schedule-screen"
            style={{
              opacity: interpolate(
                frame,
                [saved - 1, saved + 6],
                [0, 1],
                clamp,
              ),
            }}
          />
        </div>
      </div>
      <Cursor from={87} at={save} x={86} y={67} />
      <Cue at={0} effect="toggle" name="خيارات بدء التجميد" />
      <Cue at={select} effect="button" name="اختيار الجدولة" gain={0.76} />
      <Cue at={date} effect="date" name="تاريخ البدء" />
      <Cue at={time} effect="date" name="ساعة البدء" gain={0.73} />
      <Cue at={duration} effect="key" name="مدة التجميد" />
      <Cue at={reason} effect="key" name="سبب التجميد" gain={0.8} />
      <Cue at={saveEntrance} effect="wood" name="ظهور حفظ الجدولة" />
      <Cue at={save} effect="button" name="حفظ الجدولة" />
      <Cue at={saved} effect="saved" name="تأكيد الجدولة" />
      <Cue
        at={status}
        effect="rubber"
        name="الحالة قبل بدء التجميد"
        gain={0.71}
      />
    </Stage>
  );
};
