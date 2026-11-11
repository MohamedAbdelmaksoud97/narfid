import { Glyph, Stage, useReveal } from "./Visuals";

export function Payment() {
  const title = useReveal();
  const online = useReveal(0.35);
  const reception = useReveal(0.8);
  const connect = useReveal(2.25, 0.85);
  const invoice = useReveal(3.05);
  return (
    <Stage tone="mint">
      <div className="members-payment">
        <div style={{ opacity: title }}>
          <div className="members-label">سداد الاشتراك</div>
          <h1>العضو يختار طريقة الدفع</h1>
        </div>
        <div className="members-payment-options">
          <div
            className="members-payment-card"
            style={{ opacity: online, translate: `0 ${(1 - online) * 45}px` }}
          >
            <div className="members-icon">
              <Glyph icon="card" />
            </div>
            <h2>الدفع الإلكتروني</h2>
            <p>يسدد العضو من جواله</p>
          </div>
          <div
            className="members-payment-card"
            style={{
              opacity: reception,
              translate: `0 ${(1 - reception) * 45}px`,
            }}
          >
            <div className="members-icon">
              <Glyph icon="club" />
            </div>
            <h2>الدفع عند الحضور</h2>
            <p>يسدد العضو في استقبال النادي</p>
          </div>
        </div>
        <svg
          className="members-payment-connection"
          viewBox="0 0 1380 68"
          aria-hidden="true"
        >
          <path
            d="M338 0v14q0 16 16 16h320q16 0 16 16v22 M1042 0v14q0 16-16 16H706q-16 0-16 16v22"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - connect}
          />
        </svg>
        <div
          className="members-payment-result"
          style={{ opacity: invoice, translate: `0 ${(1 - invoice) * 25}px` }}
        >
          <span>
            <Glyph icon="check" />
          </span>{" "}
          الطلب والفاتورة في نظام النادي
        </div>
      </div>
    </Stage>
  );
}
