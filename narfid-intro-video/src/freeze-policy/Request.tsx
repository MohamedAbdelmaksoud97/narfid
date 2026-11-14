import { interpolate, useCurrentFrame } from "remotion";
import { clamp, Cue, Cursor, Masthead, Reveal, Screen, Stage } from "./Stage";

export const FreezeRequest = () => {
  const frame = useCurrentFrame();
  const request = 8;
  const message = 28;
  const date = 52;
  const action = 100;
  const press = 122;
  return (
    <Stage>
      <Masthead />
      <div className="freeze-request-copy">
        <Reveal className="freeze-kicker" at={request} frames={8}>
          تجميد الاشتراك
        </Reveal>
        <Reveal className="freeze-hook" at={request} frames={8} axis="x">
          «مسافر أسبوع»
        </Reveal>
        <Reveal className="freeze-request-line" at={message} axis="x">
          جمّد اشتراكي من{" "}
          <span
            className="freeze-request-date"
            style={{ background: frame >= date ? "#3ecf8e29" : "transparent" }}
          >
            ١٠ ديسمبر
          </span>
        </Reveal>
      </div>
      <Screen
        file="subscription"
        className="freeze-opening-screen"
        style={{
          scale: interpolate(frame, [action - 12, press], [1, 1.045], clamp),
          transformOrigin: "left center",
        }}
      />
      <Reveal className="freeze-request-action" at={action} axis="x">
        <span
          className="freeze-action"
          style={{ translate: frame === press ? "0 2px" : "0 0" }}
        >
          تجميد الاشتراك
        </span>
      </Reveal>
      <Cursor from={press - 20} at={press} x={19} y={78} />
      <Cue at={request} effect="felt" name="ظهور الطلب" gain={0.72} />
      <Cue at={message} effect="wood" name="سطر الطلب" />
      <Cue at={date} effect="date" name="تاريخ الطلب" gain={0.79} />
      <Cue at={action} effect="rubber" name="ظهور إجراء التجميد" gain={0.78} />
      <Cue at={press} effect="button" name="تجميد الاشتراك" />
    </Stage>
  );
};
