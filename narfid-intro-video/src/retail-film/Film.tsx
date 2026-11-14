import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  Sequence,
  getStaticFiles,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { Audio } from "@remotion/media";
import { Logo } from "../Composition";
import "./film.css";

const assets = "retail-film";
const backgroundMusic = "retail-film/audio/local-snap-crackle.mp3";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
const counter = staticFile(assets + "/counter.jpg");

function Stage({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <AbsoluteFill
      className={light ? "retail-stage retail-light" : "retail-stage"}
      dir="rtl"
    >
      {children}
    </AbsoluteFill>
  );
}

function Text({ title, note }: { title: string; note?: string }) {
  const frame = useCurrentFrame();
  return (
    <div className="retail-copy">
      <Interactive.Div
        name="عنوان المشهد"
        className="retail-title"
        style={{
          opacity: interpolate(frame, [1, 14], [0, 1], clamp),
          translate: interpolate(frame, [0, 20], ["0px 30px", "0px 0px"], ease),
        }}
      >
        {title}
      </Interactive.Div>
      {note && (
        <Interactive.Div
          name="شرح الخطوة"
          className="retail-note"
          style={{ opacity: interpolate(frame, [10, 22], [0, 1], clamp) }}
        >
          {note}
        </Interactive.Div>
      )}
    </div>
  );
}

function Capture({
  file,
  alt,
  top,
  from = 0,
  scale = 1,
  width = 936,
}: {
  file: string;
  alt: string;
  top: number;
  from?: number;
  scale?: number;
  width?: number;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      className="retail-capture"
      style={{
        top,
        left: (1080 - width) / 2,
        width,
        opacity: interpolate(frame, [from, from + 10], [0, 1], clamp),
        translate: interpolate(
          frame,
          [from, from + 22],
          ["0px 28px", "0px 0px"],
          ease,
        ),
      }}
    >
      <Img
        src={staticFile(assets + "/" + file + ".jpg")}
        alt={alt}
        style={{
          scale: interpolate(frame, [from, from + 140], [1, scale], ease),
        }}
      />
    </div>
  );
}

function Quantity({ amount, label }: { amount: string; label: string }) {
  return (
    <div className="retail-quantity">
      <span>{label}</span>
      <strong>{amount}</strong>
      <small>عبوات</small>
    </div>
  );
}

export function RetailOpening() {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Img
        className="retail-photo"
        src={counter}
        alt="عبوة ماء على كاونتر متجر نادٍ رياضي"
        style={{
          scale: interpolate(frame, [0, 36, 149], [1.055, 1.015, 1.075], ease),
          translate: interpolate(
            frame,
            [0, 36, 149],
            ["0px -17px", "0px 0px", "0px 15px"],
            clamp,
          ),
        }}
      />
      <div className="retail-opening-shade" />
      <div className="retail-opening-logo">
        <Logo />
      </div>
      <div className="retail-opening-category">
        نظام لإدارة الأندية والمنشآت الرياضية
      </div>
      <Text title="بعد البيع… كم بقي؟" note="المتجر والمخزون في نرفد" />
    </Stage>
  );
}

export function RetailReceipt() {
  const frame = useCurrentFrame();
  const received = frame >= 116;
  return (
    <Stage light>
      <Text title="وصلت دفعة للمتجر" note="فرع العليا · مياه ٥٠٠ مل" />
      <Sequence name="فتح الشحنة" durationInFrames={60} layout="none">
        <Capture
          file="carton"
          alt="فتح شحنة مياه لمتجر النادي"
          top={552}
          scale={1.05}
        />
      </Sequence>
      <Sequence
        name="تسجيل استلام ٤ عبوات"
        from={60}
        durationInFrames={56}
        layout="none"
      >
        <Capture
          file="receipt"
          alt="نموذج استلام أربع عبوات في مخزون المتجر"
          top={552}
          from={0}
          scale={1.03}
        />
      </Sequence>
      <Sequence
        name="ارتفع المتاح من ٢ إلى ٦"
        from={116}
        durationInFrames={94}
        layout="none"
      >
        <Capture
          file="stock-received"
          alt="المتاح للبيع ست عبوات بعد تسجيل الاستلام"
          top={1072}
        />
      </Sequence>
      <div
        className="retail-quantity-slot"
        style={{
          top: received ? 610 : 1370,
          opacity: interpolate(frame, [12, 24], [0, 1], clamp),
        }}
      >
        <Quantity
          amount={received ? "٦" : "+٤"}
          label={received ? "المتاح بعد الاستلام" : "الكمية المستلمة"}
        />
      </div>
    </Stage>
  );
}

export function RetailCheckout() {
  const frame = useCurrentFrame();
  const ready = frame >= 216;
  return (
    <Stage>
      <Text title="عبوة واحدة عند الكاشير" note="مياه ٥٠٠ مل · فرع العليا" />
      <Capture
        file="checkout-item"
        alt="عبوة مياه واحدة في فاتورة نقطة البيع"
        top={685}
        from={10}
        scale={1.045}
        width={890}
      />
      <div className="retail-quantity-slot" style={{ top: 1050 }}>
        <Interactive.Div
          name="نقطة البيع"
          className="retail-checkout-label"
          style={{ opacity: interpolate(frame, [58, 72], [0, 1], clamp) }}
        >
          نقطة البيع
        </Interactive.Div>
      </div>
      <Capture
        file="checkout-action"
        alt="إصدار فاتورة واحدة وتحصيلها"
        top={1150}
        from={68}
        width={720}
      />
      <div
        className="retail-checkout-result"
        style={{ opacity: interpolate(frame, [216, 230], [0, 1], clamp) }}
      >
        {ready && (
          <>
            <span className="retail-status-dot" /> تم البيع وتسجيل التحصيل
          </>
        )}
      </div>
    </Stage>
  );
}

export function RetailBalance() {
  const frame = useCurrentFrame();
  const sold = frame >= 87;
  return (
    <Stage light>
      <Text
        title="البيع غيّر الكمية المتاحة"
        note="الصنف نفسه، في الفرع نفسه"
      />
      <div className="retail-quantity-slot" style={{ top: 565 }}>
        <div className="retail-balance">
          <div>
            <span>قبل البيع</span>
            <strong>٦</strong>
          </div>
          <div className="retail-balance-arrow" aria-hidden>
            ←
          </div>
          <div className="retail-new-count">
            <span>بعد البيع</span>
            <strong
              style={{ scale: interpolate(frame, [87, 103], [1.07, 1], ease) }}
            >
              {sold ? "٥" : "…"}
            </strong>
          </div>
        </div>
      </div>
      <Sequence name="الرصيد قبل البيع" durationInFrames={87} layout="none">
        <Capture
          file="stock-received"
          alt="رصيد ست عبوات قبل البيع"
          top={1148}
          from={10}
        />
      </Sequence>
      <Sequence
        name="الرصيد الحقيقي بعد البيع"
        from={87}
        durationInFrames={183}
        layout="none"
      >
        <Capture file="stock-sold" alt="رصيد خمس عبوات بعد البيع" top={1148} />
      </Sequence>
    </Stage>
  );
}

export function RetailThreshold() {
  return (
    <Stage>
      <Text title="وقت مراجعة التوريد" note="المتاح وصل إلى حد إعادة الطلب" />
      <div className="retail-quantity-slot" style={{ top: 520 }}>
        <div className="retail-balance retail-threshold">
          <div>
            <span>المتاح للبيع</span>
            <strong>٥</strong>
          </div>
          <div className="retail-balance-arrow" aria-hidden>
            =
          </div>
          <div>
            <span>حد إعادة الطلب</span>
            <strong>٥</strong>
          </div>
        </div>
      </div>
      <Capture
        file="stock-sold"
        alt="خمس عبوات متاحة وحد إعادة الطلب خمس عبوات في سجل مخزون الفرع"
        top={1108}
        from={20}
      />
    </Stage>
  );
}

export function RetailClosing() {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div
        className="retail-closing"
        style={{
          opacity: interpolate(frame, [0, 19], [0, 1], clamp),
          translate: interpolate(frame, [0, 23], ["0px 24px", "0px 0px"], ease),
        }}
      >
        <Logo large />
        <Interactive.Div name="تعريف نرفد" className="retail-closing-category">
          نظام لإدارة الأندية والمنشآت الرياضية
        </Interactive.Div>
        <Interactive.Div name="دعوة العرض التوضيحي" className="retail-cta">
          احجز عرضًا توضيحيًا
        </Interactive.Div>
        <div className="retail-url" dir="ltr">
          www.narfid.com
        </div>
      </div>
    </Stage>
  );
}

export function RetailFilm() {
  return (
    <AbsoluteFill>
      <Sequence name="على كاونتر النادي" durationInFrames={150}>
        <RetailOpening />
      </Sequence>
      <Sequence name="استلام الشحنة" from={150} durationInFrames={210}>
        <RetailReceipt />
      </Sequence>
      <Sequence name="البيع والتحصيل" from={360} durationInFrames={300}>
        <RetailCheckout />
      </Sequence>
      <Sequence name="أثر البيع على المخزون" from={660} durationInFrames={270}>
        <RetailBalance />
      </Sequence>
      <Sequence name="حد إعادة الطلب" from={930} durationInFrames={240}>
        <RetailThreshold />
      </Sequence>
      <Sequence
        name="شعار نرفد والعرض التوضيحي"
        from={1170}
        durationInFrames={180}
      >
        <RetailClosing />
      </Sequence>

      {getStaticFiles().some((file) => file.name === backgroundMusic) && (
        <Audio
          name="Aetheric – Snap Crackle · موسيقى الخلفية"
          src={staticFile(backgroundMusic)}
          durationInFrames={1350}
          volume={10 ** (-40 / 20)}
        />
      )}
      <Audio
        name="ملامسة العبوة للكاونتر"
        src={staticFile("retail-film/audio/bottle.wav")}
        from={36}
        durationInFrames={18}
      />
      <Audio
        name="رص العبوات"
        src={staticFile("retail-film/audio/pack.wav")}
        from={203}
        durationInFrames={24}
      />
      <Audio
        name="تسجيل الاستلام"
        src={staticFile("retail-film/audio/receipt.wav")}
        from={266}
        durationInFrames={18}
      />
      <Audio
        name="انتقال إلى نقطة البيع"
        src={staticFile("retail-film/audio/pass.wav")}
        from={355}
        durationInFrames={28}
      />
      <Audio
        name="إتمام البيع"
        src={staticFile("retail-film/audio/checkout.wav")}
        from={576}
        durationInFrames={18}
      />
      <Audio
        name="تغير الكمية المتاحة"
        src={staticFile("retail-film/audio/balance.wav")}
        from={747}
        durationInFrames={22}
      />
      <Audio
        name="نقرة ظهور الشعار"
        src={staticFile("retail-film/audio/end.wav")}
        from={1191}
        durationInFrames={15}
      />
    </AbsoluteFill>
  );
}
