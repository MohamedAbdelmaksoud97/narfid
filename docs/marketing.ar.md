# مساحة تسويق نرفد

أُعدت في ١٥ أكتوبر ٢٠٢٦. الخطة والمحتوى للاستخدام الداخلي والمراجعة ثم النشر اليدوي؛ لم تُنشر منشورات أو تُفعّل حملات أو يُصرف إنفاق خارجي.

- `/board/marketing`: تصور تسويقي من ١٢ فصلًا، من الجمهور والعرض إلى خطة ٩٠ يومًا والإعلانات والقياس والإنتاج والمتابعة. المراجع الأولية وحدودها معروضة داخل القسم.
- `/board/marketing/social`: مدخل المنصات الأربع وتحميل الحزمة الكاملة.
- `/board/marketing/social/{snapchat,instagram,x,facebook}`: دليل مستقل لكل منصة، وصور وفيديو مخطط وسيناريو تصوير ومكتبة ٣٠ منشورًا: ١٠ تعريفية و٢٠ بلقطات فعلية من واجهات النظام.
- المقاسات التنفيذية: سناب 1080×1920، إنستجرام وفيسبوك 1440×1800، وإكس 1200×628. ليست إقرارًا بصلاحية كل مقاس لكل موضع إعلاني؛ يلزم فحص معاينة النشر.
- المكتبة تدعم معاينة PNG الأصلي، تحميله، نسخ النص والوصف البديل ومسار التتبع. روابط الوجهات نسبية حتى اعتماد الدومين.

## مصادر المحتوى والأصول

الاستراتيجية في `lib/marketing/strategy.ts`، وأدلة المنصات وتعريف التصميمات في `lib/marketing/social.ts` و`lib/marketing/product-posts.ts`. المصدر المعتمد للنصوص المرافقة الـ١٢٠ هو `lib/marketing/captions.ar.ts`؛ لكل منصة ٣٠ نصًا أصليًا مرتبًا بحسب أرقام المنشورات. أُعيد تحريرها في **١٧ أكتوبر ٢٠٢٦** بعد مراجعة رسائل المنافسين وأمثلة منشورة من سلة وفودكس وزد؛ [المصادر والقرارات التحريرية](social-copy-research.ar.md). الصور والكلمات المطبوعة داخلها والوصف البديل محفوظة. الرسائل مشتقة من مهارة NARFID وتدقيق وظائف المنصة؛ الهوية من مرجع UI-system، مع Tajawal وشعار `public/logo.png`. لا تحتوي الحزمة ادعاءات أداء أو شهادات عملاء أو أسعار باقات مطبوعة.

الاسم الإنجليزي الصحيح **narfid**. صور المنشورات تستخدم الشعار العربي الأصلي، دون إضافة اسم إنجليزي أو قفل نصي أو ترقيم حملة أعلى اليسار. حُذف القفل السابق من الصور الأربعين ومن قالب التصدير؛ لا يُستبدل بتهجئة أخرى.

حُذفت أيضًا عبارات وصف الصورة من جميع التصميمات، ومنها «مشهد ورسم توضيحيان» و«مشهد تصوري» و«رسم توضيحي للفكرة» وشارات وصف لقطة النظام. يبقى الإفصاح عن المصادر وبيانات العرض في الوصف البديل والمكتبة وهذا التوثيق، خارج الصورة.

## لقطات المنصة الجديدة

الأداة `scripts/capture-marketing-screens.ts` تصوّر واجهات مشروع `go/go` الفعلية في Chromium. تُطبّق ألوان نرفد وشعارها وخط Tajawal داخل جلسة المتصفح فقط. كل استجابات API في التصوير معزولة ببيانات عرض مصطنعة؛ لا تُستخدم حسابات عملاء ولا تُرسل طلبات للخادم الخلفي ولا تُكتب بيانات في النظام ولا يتغير مصدر مشروع GO.

الأصول في `content/marketing/source/screens/`: ١٤ شاشة، لكل منها لقطة كاملة وأخرى مركزة على محتوى العمل. تشمل لوحة المتابعة والأعضاء والاشتراكات والحضور والحجوزات والموظفين والمخزون والفروع والصلاحيات وقائمة اليوم والمطبخ وكتالوج الوجبات والسجلات المالية والخدمات. يسجل `provenance.json` المصدر ومسارات الشاشات وطريقة تجهيزها. الأسماء والأرقام والقيم في اللقطات بيانات عرض وليست نتائج عميل. يختار كل منشور لقطته ونسختها في `product-posts.ts`، ويسجلها ملف `manifest.json`.

المحتوى الجديد موزّع على الأسابيع ٥–١١ بمعدل يقارب ثلاثة منشورات أسبوعيًا، بعد العشرة الأصلية في أول أربعة أسابيع. يُراجع الإيقاع حسب التفاعل وجودة الطلبات.

تستخدم منشورات النظام اللقطات الجديدة أعلاه، بما فيها منشور العرض التوضيحي من المجموعة الأصلية. الخلفيات الست في `content/marketing/source/` مشاهد تصورية، لا تُنسب إلى منشآت حقيقية. أُنشئت بأداة **imagegen المدمجة** وحُفظت داخل المشروع. الرسومات والأيقونات تعليمية، منفذة بـHTML/CSS وLucide، وليست شاشات منتج مزعومة.

| الأصل                   | الاستخدام                                        |
| ----------------------- | ------------------------------------------------ |
| `gym-concept.png`       | صالة تدريب لمنشورات التعريف والاشتراكات والشراكة |
| `reception-concept.png` | استقبال النادي والاشتراكات ونقاط البيع           |
| `court-concept.png`     | الملعب الأصلي، لمنشورات الحجوزات فقط             |
| `kitchen-concept.png`   | تحضير الوجبات الصحية                             |
| `inventory-concept.png` | المنتجات والمخزون الرياضي                        |
| `workspace-concept.png` | الإدارة والفروع والانتقال والشراكة               |

تحتوي كل مجموعة منصة على المشاهد الست، وتختلف خلفية بعض الموضوعات بين المنصات. ربط كل منشور بمشهده ووصفه البديل في `lib/marketing/social.ts`، ويتضمن `manifest.json` المشهد المستخدم إلى جانب البصمة والمقاس.

نصوص توليد الخلفيات الخمس الجديدة: النص المشترك التالي ثم وصف المشهد المعني، كما استُخدما في كل استدعاء مستقل:

> Use case: ads-marketing. Asset type: original background photograph for Arabic social posts of narfid, a Saudi B2B sports-management technology provider. Style: premium realistic editorial photography, believable materials, charcoal architecture #1c1c1c, muted neutral tones with restrained natural emerald #3ecf8e accents. One continuous wide 3:2 photograph, not a collage or a poster. Compose an interesting central/lower scene that survives portrait cropping, with darker quiet space near the top for later typesetting. Realistic soft directional lighting, sophisticated calm professional atmosphere. No people, no readable text, no letters or numbers, no logos, no signage, no watermarks, no UI. Illustrative fictional facility, not a named client.

- `gym-concept.png`: Scene: a contemporary fitness club strength-training floor, architectural view down neatly arranged charcoal dumbbell racks, adjustable training benches and cable stations, subtle emerald upholstery, textured rubber floor, diffused daylight through tall windows. Focus on recognisable high-quality gym equipment; no sports court.
- `reception-concept.png`: Scene: a premium Saudi fitness club reception, curved charcoal stone check-in desk, a small blank-screen point-of-sale terminal, neat turnstile in the distance, softly lit lockers and an emerald accent lounge chair. Natural timber details, welcoming professional interior. No sports court, no gym machines dominating.
- `kitchen-concept.png`: Scene: a sports club healthy-meal preparation counter, editorial close view of neatly organised unbranded meal boxes, fresh grilled chicken, rice and vibrant vegetables, a stainless preparation bench and softly blurred professional kitchen in the background. Charcoal containers and an emerald tile detail, appetising natural light. No court or gym equipment.
- `inventory-concept.png`: Scene: a well-organised sports club retail stockroom, eye-level close architectural view of charcoal shelves with neatly folded mint and grey towels, blank unbranded sports bottles, small plain boxes, spare training bands. Soft diagonal window light, tidy practical inventory setting, real materials, restrained emerald accents. No text on any packaging. No court.
- `workspace-concept.png`: Scene: a sports institution manager's quiet modern workspace beside a glazed view toward an out-of-focus fitness facility. A charcoal desk with a closed blank notebook, pen, slim laptop seen from the back with no logo, and a subtle emerald chair. Refined administrative setting with depth and believable daylight, focus on the desk. No charts, no readable screen content, no court.

## إعادة التصدير

**لتعديل النص المرافق فقط:** حرّر `lib/marketing/captions.ar.ts` ثم شغّل `npm run marketing:captions`. يحدّث ملفات TXT وحزم ZIP المحلية من الصور الحالية، دون تشغيل Chromium أو إعادة رسم PNG أو المعاينات أو تغيير manifest. النصوص في مكتبة الإدارة والتنزيلات تعتمد على نفس المصدر؛ لا تعدّل ملفات TXT يدويًا.

بعد تعديل النص أو التصميم: `npm run build` لتجهيز ملفات Tajawal، ثم `npm run marketing:export`. التصدير يحتاج Chromium من Playwright وPython 3 لإنشاء ZIP بمكتبته القياسية؛ لا يحتاج مفاتيح API أو قاعدة بيانات أو اتصالًا بخدمات نشر.

المخرج `content/marketing/assets/`: ١٢٠ PNG، و١٢٠ معاينة WebP خفيفة، و١٢٠ ملف نص مرافق، وmanifest بأبعاد وبصمات الملفات واللقطة المستخدمة؛ هذه هي الملفات الـ٣٦١ المحفوظة في Git. يُنتج التصدير أيضًا أربع حزم منصة وحزمة كاملة للاستخدام المحلي فقط، وتتجاهلها `.gitignore`. لا تُرفع ملفات ZIP المكررة إلى GitHub؛ الحزمة الكاملة تجاوزت حد الملف في GitHub عند إضافة المنشورات الجديدة.

أزرار تحميل الحزمة الكاملة وحزم المنصات تعمل دون ملفات ZIP مسبقة: بعد التحقق من صلاحيات مجلس الإدارة، يُنشئ الخادم ZIP تدريجيًا من ملفات PNG وTXT الأصلية باستخدام `fflate`، مع قراءة ملف واحد في كل مرة ومراعاة سرعة التنزيل. لا تُعاد معالجة الصور ولا تتغير جودتها، ولا يحتاج تشغيل الموقع إلى Python أو إنشاء أرشيف على قرص الخادم. لا تدخل ZIP المحلية في تتبع حزمة Next؛ تُضمّن ملفات الصور والنصوص وفهرسها الـ٣٦١ لمسار التحميل.

لتحديث لقطات الواجهات: شغّل نسخة مشروع GO المحلية على `127.0.0.1:3014`، ثم `npx tsx scripts/capture-marketing-screens.ts` من مجلد narfid. يمكن تحديد العنوان المحلي بمتغير `MARKETING_REFERENCE_URL`. بعدها أعد تصدير المنشورات؛ لا حاجة إلى تسجيل دخول عميل أو مفتاح خدمة.

الأصول لا تُخدم من `public`. مسار `/api/board/marketing/assets/[...asset]` يتحقق من الحساب وعضوية مجلس الإدارة النشطة، ويقبل قائمة ملفات محددة، ويرسل `private, no-store` و`noindex`. التتبع الصريح في Next يضم المخرجات إلى حزمة النشر. أسرار Supabase وملفات `.private` لا تدخل الصور أو ZIP.

## التحقق

`npm run test:marketing` يفحص ٣٠ منشورًا لكل منصة، بينها ٢٠ بلقطات النظام، وتفرّد النصوص وحد إكس والأبعاد والبصمات وتطابق ملفات النص وربط الوصف البديل بالمشهد أو اللقطة. اختبار `tests/browser/marketing.spec.ts` يفحص صلاحيات الزائر والتنقل والمعاينة والنسخ والتحميل والملفات المائة والعشرين وواجهة الهاتف. يشمل التصدير منع الاسم الإنجليزي وترقيم الحملة وعبارات وصف الصورة، وفحص تجاوز المساحة وفحص CRC لكل أرشيف.

نجحت فحوص المحتوى والأصول المائة والعشرين، وESLint، وبناء الإنتاج مع TypeScript. روجعت الصور الـ١٢٠ ولقطات المصدر الـ١٤ بصريًا، ونجح اختبار Chromium على نسخة الإنتاج المحلية: ٣٠ بطاقة لكل منصة، ومعاينة وتحميل بوست جديد بلقطة نظام، ونسخ النص والوصف البديل، وقراءة الصور الـ١٢٠ وحزم المنصات والحزمة الكاملة، ومنع الزائر من الوصول. نجحت معاينة منشور المطبخ على الهاتف دون تجاوز أفقي. لم يتغير مصدر مشروع GO.

نجح فحص أرشيف إكس المُنشأ أثناء التنزيل: ٦٠ ملفًا، بمطابقة بصمة كل صورة وملف نص مع أصله؛ والحزمة الكاملة تضم ٢٤٠ ملفًا. نجح بناء الإنتاج وESLint واختبار Chromium للحزم الخمس والصور الـ١٢٠ بعد إخراج الأرشيفات من Git. تحقق تتبع Next من تضمين ٣٦١ ملف مصدر دون أي ZIP.

مراجعة النصوص بتاريخ **١٧ أكتوبر ٢٠٢٦**: نجحت اختبارات المحتوى والأصول والأرشيف الثلاثة وESLint وبناء الإنتاج. حُدثت النصوص الـ١٢٠ والحزم المحلية الخمس؛ تحققت سلامة الأرشيفات وتطابق ملفات TXT فيها، وثبات الصور والمعاينات وmanifest دون إعادة تصديرها.
