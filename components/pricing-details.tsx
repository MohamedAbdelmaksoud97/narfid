import { memberPolicy, planAddons } from "@/lib/landing-content";

export function PricingDetails() {
  return (
    <>
      <section className="public-checklist">
        <h2>إضافات اختيارية لأي باقة</h2>
        <ul>
          {planAddons.map((addon) => (
            <li key={addon.name}>
              <strong>{addon.name}:</strong> {addon.description}
            </li>
          ))}
        </ul>
        <p>
          هذه الإضافات منفصلة عن الاشتراك الأساسي، ويُحدّد سعر كل منها بعد
          مراجعة نطاق التهيئة والخدمة. الضرائب والتهيئة ونقل البيانات والتدريب
          والدعم تُوضّح في العرض النهائي.
        </p>
      </section>
      <section className="public-checklist">
        <h2>كيف نحسب الأعضاء ونراجع الترقية؟</h2>
        <p>{memberPolicy.definition}</p>
        <p>{memberPolicy.upgrade}</p>
        <p>{memberPolicy.venues}</p>
      </section>
    </>
  );
}
