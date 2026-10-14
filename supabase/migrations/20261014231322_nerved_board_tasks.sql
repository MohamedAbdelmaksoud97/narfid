begin;

create table public.board_tasks (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.board_tasks(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text not null default '' check (char_length(description) <= 6000),
  priority text not null default 'normal' check (priority in ('high', 'normal', 'low')),
  completed boolean not null default false,
  sort_order integer not null default 0,
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is distinct from id)
);
create index board_tasks_parent_order_idx on public.board_tasks(parent_id, sort_order, created_at, id);
alter table public.board_tasks enable row level security;
revoke all on public.board_tasks from anon, authenticated;
grant select on public.board_tasks to authenticated;
create policy board_tasks_read on public.board_tasks for select to authenticated
  using (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));

-- Writes intentionally have one atomic entry point: normalize parent completion,
-- forbid deeper trees, and reject stale changes. Direct Data API writes are denied.
-- The privileged implementation is in an unexposed schema and checks live membership.
create schema if not exists private;
grant usage on schema private to authenticated;
create function private.mutate_board_task(action text, payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  task public.board_tasks;
  parent public.board_tasks;
  task_id uuid := (payload ->> 'id')::uuid;
  parent_task_id uuid := nullif(payload ->> 'parent_id', '')::uuid;
  task_title text := btrim(payload ->> 'title');
  task_description text := coalesce(payload ->> 'description', '');
  task_priority text := coalesce(payload ->> 'priority', 'normal');
  desired boolean;
begin
  if auth.uid() is null or not exists (
    select 1 from public.board_members where user_id = auth.uid() and active
  ) then raise exception 'TASK_FORBIDDEN' using errcode = '42501'; end if;
  -- Five-person shared board: serialize short writes, including subtree changes.
  perform pg_advisory_xact_lock(840501, 1);
  if task_id is null then raise exception 'TASK_INVALID' using errcode = '22023'; end if;
  if action in ('create', 'update') and (
    task_title is null or char_length(task_title) not between 1 and 200
    or char_length(task_description) > 6000 or task_priority not in ('high', 'normal', 'low')
  ) then raise exception 'TASK_INVALID' using errcode = '22023'; end if;

  if action = 'create' then
    if parent_task_id is not null then
      select * into parent from public.board_tasks where id = parent_task_id;
      if not found or parent.parent_id is not null then
        raise exception 'TASK_PARENT_INVALID' using errcode = '22023';
      end if;
      if parent.revision <> (payload ->> 'parent_revision')::bigint
        or payload ->> 'parent_revision' is null then
        raise exception 'TASK_CONFLICT' using errcode = '40001';
      end if;
    end if;
    insert into public.board_tasks(id, parent_id, title, description, priority, sort_order)
    values(task_id, parent_task_id, task_title, task_description, task_priority,
      (select coalesce(max(sort_order), 0) + 1 from public.board_tasks where parent_id is not distinct from parent_task_id));
  else
    select * into task from public.board_tasks where id = task_id;
    if not found then raise exception 'TASK_NOT_FOUND' using errcode = 'P0002'; end if;
    if payload ->> 'revision' is null or task.revision <> (payload ->> 'revision')::bigint then
      raise exception 'TASK_CONFLICT' using errcode = '40001';
    end if;
    parent_task_id := task.parent_id;
    if action = 'update' then
      update public.board_tasks set title = task_title, description = task_description,
        priority = task_priority, revision = revision + 1, updated_at = now() where id = task_id;
    elsif action = 'toggle' then
      if jsonb_typeof(payload -> 'completed') is distinct from 'boolean' then
        raise exception 'TASK_INVALID' using errcode = '22023';
      end if;
      desired := (payload ->> 'completed')::boolean;
      update public.board_tasks set completed = desired, revision = revision + 1, updated_at = now()
        where id = task_id or board_tasks.parent_id = task_id;
    elsif action = 'delete' then
      delete from public.board_tasks where id = task_id;
    else raise exception 'TASK_INVALID' using errcode = '22023';
    end if;
  end if;
  if parent_task_id is not null then
    update public.board_tasks set
      completed = case when exists(select 1 from public.board_tasks c where c.parent_id = parent_task_id)
        then not exists(select 1 from public.board_tasks c where c.parent_id = parent_task_id and not c.completed)
        else completed end,
      revision = revision + 1, updated_at = now()
    where id = parent_task_id;
  end if;
  return task_id;
end;
$$;
revoke all on function private.mutate_board_task(text, jsonb) from public, anon, authenticated;
grant execute on function private.mutate_board_task(text, jsonb) to authenticated;
create function public.mutate_board_task(action text, payload jsonb)
returns uuid language sql security invoker set search_path = '' as $$
  select private.mutate_board_task(action, payload);
$$;
revoke all on function public.mutate_board_task(text, jsonb) from public, anon;
grant execute on function public.mutate_board_task(text, jsonb) to authenticated;

-- One-time roadmap seed, never re-run during page rendering or application startup.
with phases(id, title, description, priority, sort_order, steps) as (values
('a1400000-0000-4000-8000-000000000001'::uuid, 'إطلاق موقع نرفد رسميًا',
 'النتيجة المطلوبة: موقع متاح على الدومين المعتمد، وبريد مهني، وصفحات قابلة للفهرسة بعد مراجعة الإطلاق. تجهيزات السيو موجودة؛ هذه المهام تكمل الإطلاق الفعلي.', 'high', 1,
 '[
 {"title":"اختيار الدومين وتسجيله باسم الجهة المالكة","description":"مراجعة ملاءمة الاسم وتوافره، ثم توثيق ملكية النطاق وصلاحيات إدارته وتجديده. لا تعتمد عناوين nerfed.example التجريبية كبريد تجاري."},
 {"title":"تجهيز الاستضافة وربط الدومين وHTTPS","description":"اختيار بيئة التشغيل، ضبط متغيرات الإنتاج دون كشف المفاتيح، تحديد الدومين الأساسي، واختبار التحويلات والنسخة المنشورة."},
 {"title":"إنشاء البريد المهني للشركة","description":"تحديد بريد المبيعات والدعم على الدومين، وضبط سجلات التحقق والإرسال واستقبال رسالة تجريبية لكل عنوان."},
 {"title":"مراجعة الموقع على الهاتف واللابتوب قبل الإطلاق","description":"اختبار التنقل والروابط وطلبات العرض وصفحات الحلول والمقالات والصور، وتسجيل دخول الإدارة وحماية صفحاتها. مراجعة المحتوى ووسائل التواصل الحقيقية."},
 {"title":"تفعيل الفهرسة بعد اجتياز مراجعة الإنتاج","description":"ضبط NEXT_PUBLIC_SITE_URL على عنوان HTTPS النهائي ثم SITE_INDEXING_ENABLED=true. التحقق من canonical وrobots.txt وsitemap.xml ومنع فهرسة لوحة الإدارة وبيئات المعاينة."},
 {"title":"ربط Google Search Console وإرسال خريطة الموقع","description":"إثبات ملكية الدومين، إرسال sitemap.xml، وفحص الصفحة الرئيسية ومقال نموذجي وصفحة حل. معالجة أخطاء الفهرسة دون توقع ترتيب فوري."},
 {"title":"تجهيز التحليلات والموافقة واختبار الأحداث","description":"إنشاء حساب القياس وإعداد الموافقة، وإيقاف القياس المحسن بحسب دليل الإطلاق، ثم التحقق الفعلي باستخدام Tag Assistant وDebugView. فصل بدء طلب العرض ونقرة واتساب عن الطلب المستلم فعليًا."}
 ]'::jsonb),
('a1400000-0000-4000-8000-000000000002', 'استقبال العملاء المحتملين ومتابعة المبيعات',
 'النتيجة المطلوبة: كل طلب عرض محفوظ، وله حالة ومسؤول وخطوة متابعة، ويمكن معرفة مصدره ونتيجته. الأولوية البرمجية التالية المقترحة.', 'high', 2,
 '[
 {"title":"تحديد بيانات نموذج طلب العرض","description":"حقول مناسبة مثل اسم المؤسسة، اسم المسؤول، وسيلة التواصل، نوع النشاط، عدد الفروع والاحتياج الأساسي. جمع الحد اللازم وتوضيح استخدام البيانات."},
 {"title":"بناء نموذج العرض وحفظ الطلبات بأمان","description":"تحقق من المدخلات ومنع الإرسال المتكرر والإساءة، ورسالة نجاح مرتبطة بحفظ الطلب فعليًا، مع معالجة واضحة لفشل الحفظ."},
 {"title":"إضافة قسم العملاء المحتملين في لوحة الإدارة","description":"عرض الطلبات وتفاصيلها، وإسناد مسؤول وملاحظات وموعد متابعة، مع قصر الوصول على الفريق المخول."},
 {"title":"تطبيق مراحل متابعة البيع","description":"طلب جديد، تم التواصل، عرض توضيحي، عرض سعر، تعاقد أو إغلاق. تسجيل سبب الخسارة أو التأجيل والخطوة التالية."},
 {"title":"ربط مصادر الطلبات وقياس التحويل الحقيقي","description":"حفظ الصفحة أو الحملة التي جاء منها الطلب دون تسجيل بيانات شخصية في التحليلات. إرسال حدث الطلب المؤكد بعد نجاح الحفظ، وقياس المراحل حتى التعاقد."},
 {"title":"تحديد مسؤول استقبال الطلبات وآلية المتابعة","description":"توزيع المسؤولية بين أعضاء الفريق، ووضع وقت استجابة عملي وقوالب تواصل متسقة مع صوت نرفد، ثم اختبار رحلة طلب كاملة."}
 ]'::jsonb),
('a1400000-0000-4000-8000-000000000003', 'استكمال تحويل المنصة إلى SaaS',
 'النتيجة المطلوبة: مؤسسات مستقلة باشتراكات نرفد السنوية، وصلاحيات وباقات وعزل بيانات مثبت. نظام GO مرجع؛ تبدأ هذه المرحلة بتصميم ومراجعة النطاق قبل تعديل المنتج.', 'high', 3,
 '[
 {"title":"اعتماد التصميم الفني وحدود مشروع SaaS","description":"مراجعة تدقيق النظام الموجود وتحديد تغييرات المنتج ومشروع التنفيذ. فصل اشتراك النادي في نرفد عن اشتراكات أعضاء النادي، وتوثيق خطة الانتقال دون تعطيل أول عميل."},
 {"title":"تصميم إنشاء المؤسسة وتهيئة حساب المالك","description":"إنشاء المؤسسة والفروع والإعدادات والأدوار الافتراضية وحساب المالك في إجراء قابل لإعادة المحاولة، واختبار فشل التهيئة واستكمالها."},
 {"title":"معالجة الهوية وتسجيل الدخول عبر المؤسسات","description":"حسم العضو أو الموظف الذي ينتمي لأكثر من مؤسسة، وتكرار أرقام الموظفين بين الأندية، واستعادة الحسابات وتبديل السياق بشكل آمن."},
 {"title":"إزالة الاعتماد على بيانات أول عميل","description":"مراجعة أسماء Go Fitness والإعدادات والدومينات والرسائل والملفات والتكاملات الخاصة به، وتحويل ما يلزم إلى إعدادات لكل مؤسسة."},
 {"title":"بناء إدارة عقود واشتراكات نرفد السنوية","description":"العميل المؤسسي والباقة وبداية ونهاية الاشتراك والتجديد وحالته، مع سياسة واضحة للتأخر والإيقاف وإعادة التفعيل وتصدير البيانات."},
 {"title":"فرض مميزات وحدود الباقات من السيرفر","description":"تفعيل الوحدات وعدد الفروع والحدود التجارية المتفق عليها بصورة مستقلة عن صلاحيات الموظفين. اختبار تجاوز الواجهة أو استدعاء API مباشرة."},
 {"title":"تحديد وتنفيذ دورة تحصيل اشتراك المنصة","description":"اعتماد طريقة التحصيل أولًا، وتوثيق المبالغ وحالة السداد والتسوية. إذا اعتمد الدفع الإلكتروني، تُقيّم بوابة مناسبة وتُختبر webhooks والتكرار والفشل والاسترداد حسب النطاق."},
 {"title":"اختبار عزل المؤسسات والملفات والصلاحيات","description":"إنشاء مؤسستين تجريبيتين واختبار جميع المسارات الحساسة والروابط والملفات والتقارير، بما يشمل منع الوصول المتبادل وتغيير المعرّفات."},
 {"title":"تجهيز النسخ الاحتياطي والمراقبة وخطة الاستعادة","description":"إجراء استعادة تجريبية، ومراقبة الأخطاء والإتاحة، ومراجعة الوصول الإداري والمصادقة الإضافية، وتوثيق إجراء الأعطال قبل التوسع."}
 ]'::jsonb),
('a1400000-0000-4000-8000-000000000004', 'اعتماد الباقات والعرض التجاري',
 'النتيجة المطلوبة: عرض يمكن بيعه وتنفيذه بتكلفة مفهومة ونطاق موثق. الأسعار الحالية مقترحات إطلاق تحتاج اعتمادًا، وليست نتائج مثبتة للسوق.', 'high', 4,
 '[
 {"title":"حساب تكلفة خدمة المؤسسة والتجهيز","description":"حصر الاستضافة والتخزين والرسائل ومزودي الخدمات والدعم والتدريب ونقل البيانات، وفصل التكلفة المتكررة عن تكلفة بدء التشغيل."},
 {"title":"مراجعة الباقات والأسعار مع عملاء مستهدفين","description":"اختبار ملاءمة أساس وتشغيل وتوسع مع ملاك ومديري مؤسسات رياضية سعودية، وتسجيل الاعتراضات والقيمة المطلوبة، ثم اعتماد الأسعار والنطاق."},
 {"title":"توثيق المشمول والإضافات وحدود كل باقة","description":"تحديد الوحدات والفروع والتدريب والدعم ونقل البيانات والزيادات، مع فصل التطبيق الخاص والبوابات والتكاملات المخصصة عن الاشتراك القياسي."},
 {"title":"إعداد عرض السعر وشروط الاشتراك والتجديد","description":"توضيح المدة والتحصيل والتجديد والإلغاء والخدمة والدعم ومسؤوليات الطرفين. مراجعة المتطلبات النظامية والضريبية والخصوصية مع مختص قبل اعتماد الادعاءات والعقود."},
 {"title":"اعتماد سياسة البيانات والخصوصية ومزودي الخدمة","description":"تحديد بيانات العميل والغرض من معالجتها والوصول والاستضافة والاحتفاظ والتصدير والحذف، ومراجعة ملاءمتها للسوق المستهدف قبل نشر السياسات."},
 {"title":"تجهيز نموذج تقييم الشراكة التقنية","description":"جمع متطلبات التطبيق أو البوابة أو النظام الخارجي، وتقييم التوافق والنطاق والتكلفة والصيانة والرسوم الخارجية قبل الالتزام بالتنفيذ."}
 ]'::jsonb),
('a1400000-0000-4000-8000-000000000005', 'تجهيز البيع وتشغيل العملاء الجدد',
 'النتيجة المطلوبة: رحلة بيع وتهيئة وتدريب ودعم يمكن تكرارها، مع قياس الاستخدام الفعلي والتكلفة ورضا العميل.', 'normal', 5,
 '[
 {"title":"تجهيز نسخة عرض ببيانات تجريبية","description":"بيانات مؤسسة وأعضاء وفروع وفواتير وحجوزات ووجبات مناسبة للعرض، دون بيانات شخصية أو مالية حقيقية للعملاء."},
 {"title":"إعداد سيناريو عرض لكل صاحب قرار","description":"عرض للمالك عن المتابعة والتجديد، وللتشغيل عن يوم العمل، وللمالية عن التحصيل والورديات، وللمجموعات عن الفروع والصلاحيات."},
 {"title":"توثيق استقبال العميل ونقل بياناته","description":"قائمة بيانات مطلوبة، قالب استيراد، تحقق من الجودة والأرصدة، صلاحيات النقل، وخطة انتقال ومراجعة واعتماد من العميل."},
 {"title":"تجهيز التدريب والدعم والتسليم","description":"مواد قصيرة حسب الدور، جلسة تهيئة، قناة دعم ومسؤول واضح، وقائمة قبول للتشغيل يمكن للفريق والعميل الرجوع إليها."},
 {"title":"تشغيل عميل أو اثنين إضافيين بنطاق متفق عليه","description":"اختيار مؤسسات مناسبة كبداية، تحديد معايير القبول، ومتابعة المشكلات وتبني الوظائف وتكلفة الخدمة قبل توسيع المبيعات."},
 {"title":"توثيق دراسة حالة Go Fitness بموافقة العميل","description":"الحصول على موافقة استخدام الاسم والمواد، ثم توثيق المشكلة والحل والنتائج التي يمكن إثباتها. لا تنشر شهادة أو أرقامًا أو بيانات خاصة دون سند وموافقة."},
 {"title":"مراجعة نجاح التشغيل والتعلم من الاعتراضات","description":"قياس الوقت حتى أول استخدام، اكتمال التهيئة، نشاط الوظائف، أسباب الفوز والرفض، وتكلفة الدعم. تحويل النتائج إلى تحسينات ومهام متابعة."}
 ]'::jsonb),
('a1400000-0000-4000-8000-000000000006', 'تطوير السيو والمحتوى بصورة مستمرة',
 'النتيجة المطلوبة: زيارات من جمهور مناسب وطلبات عرض يمكن تتبعها. الأساس التقني والمقالات الثمانية مجهزة؛ القياس الفعلي يبدأ بعد إطلاق الدومين وربط الأدوات.', 'normal', 6,
 '[
 {"title":"جمع خط أساس لأول شهر بعد الإطلاق","description":"مراجعة الفهرسة والظهور والنقرات والصفحات والبلدان وطلبات العرض، مع توثيق تاريخ بدء القياس وعدم استنتاج نتائج قبل توفر بيانات كافية."},
 {"title":"إجراء مراجعة شهرية للبحث والتحويلات","description":"تحديد الصفحات ذات الفرص، والأسئلة التي يظهر عليها الموقع، ونقاط فقد الطلبات. تسجيل النتيجة والإجراء والمسؤول في لوحة الإدارة."},
 {"title":"مراجعة المقالات الثمانية وتحديثها","description":"التحقق من مطابقة الوظائف الحالية ودقة الصور والروابط والعناوين والوصف، وإزالة التكرار وتحديث ما تغير فعليًا. لا تغيّر التاريخ لمجرد إظهار حداثة وهمية."},
 {"title":"إنشاء قائمة محتوى من أسئلة العملاء وبيانات البحث","description":"تجميع أسئلة المبيعات والدعم والكلمات ذات الصلة بالمؤسسات الرياضية، وتحديد سؤال المقال والجمهور والهدف وصفحة الحل المرتبطة قبل الكتابة."},
 {"title":"نشر محتوى مفيد ومراجعته من المحرر الحالي","description":"استخدام مهارة narfid-articles، وتوثيق الادعاءات والمصادر والصور عند الحاجة. ربط المقالات بالحلول ومقالات ذات صلة دون حشو كلمات أو وعود ترتيب."},
 {"title":"مراقبة الفهرسة والأداء والمشكلات التقنية","description":"متابعة أخطاء Search Console والروابط والتحويلات وتجربة الهاتف وسرعة الصفحات وبيانات Core Web Vitals عند توافرها. تنفيذ فحوص مرتبطة بالمشكلة الفعلية."},
 {"title":"تحديث قسم السيو بالمرحلة الحالية والخطوة التالية","description":"بعد كل دورة مراجعة، توثيق ما نُفذ والنتائج المتاحة وما يحتاج بيانات أو إعدادًا خارجيًا، وتحويل التحسينات التالية إلى مهام جديدة بتاريخ متابعة مناسب."}
 ]'::jsonb)
), roots as (
  insert into public.board_tasks(id, title, description, priority, sort_order)
  select id, title, description, priority, sort_order from phases returning id
)
insert into public.board_tasks(parent_id, title, description, priority, sort_order)
select phases.id, step ->> 'title', step ->> 'description', phases.priority, ordinal::integer
from phases join roots on roots.id = phases.id,
lateral jsonb_array_elements(phases.steps) with ordinality as items(step, ordinal);

commit;
