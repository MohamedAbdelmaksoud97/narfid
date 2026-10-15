# مساحة تسويق نرفد

أُعدت في ١٥ أكتوبر ٢٠٢٦. الخطة والمحتوى للاستخدام الداخلي والمراجعة ثم النشر اليدوي؛ لم تُنشر منشورات أو تُفعّل حملات أو يُصرف إنفاق خارجي.

- `/board/marketing`: تصور تسويقي من ١٢ فصلًا، من الجمهور والعرض إلى خطة ٩٠ يومًا والإعلانات والقياس والإنتاج والمتابعة. المراجع الأولية وحدودها معروضة داخل القسم.
- `/board/marketing/social`: مدخل المنصات الأربع وتحميل الحزمة الكاملة.
- `/board/marketing/social/{snapchat,instagram,x,facebook}`: دليل مستقل لكل منصة، وصور وفيديو مخطط وسيناريو تصوير ومكتبة ١٠ منشورات.
- المقاسات التنفيذية: سناب 1080×1920، إنستجرام وفيسبوك 1440×1800، وإكس 1200×628. ليست إقرارًا بصلاحية كل مقاس لكل موضع إعلاني؛ يلزم فحص معاينة النشر.
- المكتبة تدعم معاينة PNG الأصلي، تحميله، نسخ النص والوصف البديل ومسار التتبع. روابط الوجهات نسبية حتى اعتماد الدومين.

## مصادر المحتوى والأصول

الاستراتيجية في `lib/marketing/strategy.ts`، وأدلة المنصات والأربعون نصًا في `lib/marketing/social.ts`. الرسائل مشتقة من مهارة NARFID وتدقيق وظائف المنصة؛ الهوية من مرجع UI-system، مع Tajawal وشعار `public/logo.png`. لا تحتوي الحزمة أرقام أداء أو شهادات عملاء أو أسعارًا مقترحة مطبوعة.

الصورة `public/images/nerved-dashboard.png` أصل الموقع المعاد تسميته ببيانات تجريبية؛ ليست تقرير نتائج عميل. خلفية الملعب في `content/marketing/source/court-concept.png` مشهد تصوري أنشئ بأداة **imagegen المدمجة**. لا يُنسب إلى منشأة حقيقية. الرسومات والأيقونات تعليمية، منفذة بـHTML/CSS وLucide، وليست شاشات منتج مزعومة.

نص توليد الخلفية:

> Use case: ads-marketing. Asset type: one original editorial background photograph for a Saudi B2B sports-management technology brand called Nerved. Generate a premium, realistic architectural photograph of a contemporary indoor sports club: an empty indoor padel court with charcoal walls, a restrained emerald-green court and thin mint court lines, dramatic but believable side lighting, carefully detailed floor and mesh, quiet professional atmosphere. Wide horizontal composition, high resolution. Main visual interest in lower-right and central court geometry, upper-left dark negative space suitable for later Arabic typesetting. Palette charcoal #1c1c1c, muted gray, subtle natural emerald #3ecf8e accents. No people, no flags, no readable text, no logos, no UI, no statistics, no watermarks. This is an illustrative brand scene, not a photograph of an existing named client. Do not create a poster or add any text. One continuous photorealistic image.

## إعادة التصدير

بعد تعديل النص أو التصميم: `npm run build` لتجهيز ملفات Tajawal، ثم `npm run marketing:export`. التصدير يحتاج Chromium من Playwright وPython 3 لإنشاء ZIP بمكتبته القياسية؛ لا يحتاج مفاتيح API أو قاعدة بيانات أو اتصالًا بخدمات نشر.

المخرج `content/marketing/assets/`: ٤٠ PNG، و٤٠ معاينة WebP خفيفة، و٤٠ ملف نص مرافق، و٤ حزم منصة وحزمة كاملة، وmanifest بأبعاد وبصمات الملفات. الصيغ الأصلية قابلة لإعادة الإنتاج من السكريبت والبيانات، والمخرجات نفسها محفوظة لتعمل نسخة الإنتاج دون أدوات التصدير.

الأصول لا تُخدم من `public`. مسار `/api/board/marketing/assets/[...asset]` يتحقق من الحساب وعضوية مجلس الإدارة النشطة، ويقبل قائمة ملفات محددة، ويرسل `private, no-store` و`noindex`. التتبع الصريح في Next يضم المخرجات إلى حزمة النشر. أسرار Supabase وملفات `.private` لا تدخل الصور أو ZIP.

## التحقق

`npm run test:marketing` يفحص العدد والتميّز وحد نصوص إكس والأبعاد والبصمات وتطابق ملفات النص. اختبار `tests/browser/marketing.spec.ts` يفحص صلاحيات الزائر والتنقل والمعاينة والنسخ والتحميل والملفات الأربعين وواجهة الهاتف. يشمل التصدير فحص تجاوز المساحة وفحص CRC لكل أرشيف.

نجحت فحوص المحتوى والأصول، وESLint، وبناء الإنتاج مع TypeScript. نجحت تجربة Chromium على نسخة الإنتاج المحلية: تحميل الملفات الأربعين وحزم المنصات والحزمة الكاملة، ومنع الزائر من الوصول، وتحديد الفصل أثناء التمرير، ونسخ النص والوصف البديل، ومعاينة الهاتف دون تجاوز أفقي. أُدرجت ملفات الأصول الـ١٢٦ في تتبع ملفات مسار التحميل لنسخة النشر.
