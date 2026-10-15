# مساحة تسويق نرفد

أُعدت في ١٥ أكتوبر ٢٠٢٦. الخطة والمحتوى للاستخدام الداخلي والمراجعة ثم النشر اليدوي؛ لم تُنشر منشورات أو تُفعّل حملات أو يُصرف إنفاق خارجي.

- `/board/marketing`: تصور تسويقي من ١٢ فصلًا، من الجمهور والعرض إلى خطة ٩٠ يومًا والإعلانات والقياس والإنتاج والمتابعة. المراجع الأولية وحدودها معروضة داخل القسم.
- `/board/marketing/social`: مدخل المنصات الأربع وتحميل الحزمة الكاملة.
- `/board/marketing/social/{snapchat,instagram,x,facebook}`: دليل مستقل لكل منصة، وصور وفيديو مخطط وسيناريو تصوير ومكتبة ١٠ منشورات.
- المقاسات التنفيذية: سناب 1080×1920، إنستجرام وفيسبوك 1440×1800، وإكس 1200×628. ليست إقرارًا بصلاحية كل مقاس لكل موضع إعلاني؛ يلزم فحص معاينة النشر.
- المكتبة تدعم معاينة PNG الأصلي، تحميله، نسخ النص والوصف البديل ومسار التتبع. روابط الوجهات نسبية حتى اعتماد الدومين.

## مصادر المحتوى والأصول

الاستراتيجية في `lib/marketing/strategy.ts`، وأدلة المنصات والأربعون نصًا في `lib/marketing/social.ts`. الرسائل مشتقة من مهارة NARFID وتدقيق وظائف المنصة؛ الهوية من مرجع UI-system، مع Tajawal وشعار `public/logo.png`. لا تحتوي الحزمة أرقام أداء أو شهادات عملاء أو أسعارًا مقترحة مطبوعة.

الاسم الإنجليزي الصحيح **narfid**. صور المنشورات تستخدم الشعار العربي الأصلي، دون إضافة اسم إنجليزي أو قفل نصي أو ترقيم حملة أعلى اليسار. حُذف القفل السابق من الصور الأربعين ومن قالب التصدير؛ لا يُستبدل بتهجئة أخرى.

الصورة `public/images/nerved-dashboard.png` أصل الموقع المعاد تسميته ببيانات تجريبية؛ ليست تقرير نتائج عميل. يحتفظ اسم الملف التقني القديم بمساره. الخلفيات الست في `content/marketing/source/` مشاهد تصورية، لا تُنسب إلى منشآت حقيقية. أُنشئت الخلفيات الجديدة بأداة **imagegen المدمجة** وحُفظت داخل المشروع. الرسومات والأيقونات تعليمية، منفذة بـHTML/CSS وLucide، وليست شاشات منتج مزعومة.

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

بعد تعديل النص أو التصميم: `npm run build` لتجهيز ملفات Tajawal، ثم `npm run marketing:export`. التصدير يحتاج Chromium من Playwright وPython 3 لإنشاء ZIP بمكتبته القياسية؛ لا يحتاج مفاتيح API أو قاعدة بيانات أو اتصالًا بخدمات نشر.

المخرج `content/marketing/assets/`: ٤٠ PNG، و٤٠ معاينة WebP خفيفة، و٤٠ ملف نص مرافق، و٤ حزم منصة وحزمة كاملة، وmanifest بأبعاد وبصمات الملفات. الصيغ الأصلية قابلة لإعادة الإنتاج من السكريبت والبيانات، والمخرجات نفسها محفوظة لتعمل نسخة الإنتاج دون أدوات التصدير.

الأصول لا تُخدم من `public`. مسار `/api/board/marketing/assets/[...asset]` يتحقق من الحساب وعضوية مجلس الإدارة النشطة، ويقبل قائمة ملفات محددة، ويرسل `private, no-store` و`noindex`. التتبع الصريح في Next يضم المخرجات إلى حزمة النشر. أسرار Supabase وملفات `.private` لا تدخل الصور أو ZIP.

## التحقق

`npm run test:marketing` يفحص العدد والتميّز وحد نصوص إكس والأبعاد والبصمات وتطابق ملفات النص وربط الوصف البديل بالمشهد وتنوع المشاهد الست في كل منصة. اختبار `tests/browser/marketing.spec.ts` يفحص صلاحيات الزائر والتنقل والمعاينة والنسخ والتحميل والملفات الأربعين وواجهة الهاتف. يشمل التصدير منع الاسم الإنجليزي وترقيم الحملة في رأس الصورة، وفحص تجاوز المساحة وفحص CRC لكل أرشيف.

نجحت فحوص المحتوى والأصول، وESLint، وبناء الإنتاج مع TypeScript. نجحت تجربة Chromium على نسخة الإنتاج المحلية: تحميل الملفات الأربعين وحزم المنصات والحزمة الكاملة، ومنع الزائر من الوصول، وتحديد الفصل أثناء التمرير، ونسخ النص والوصف البديل، ومعاينة الهاتف دون تجاوز أفقي. أُدرجت ملفات الأصول الـ١٢٦ في تتبع ملفات مسار التحميل لنسخة النشر.
