import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { campaignBriefs, campaignKeywords, campaignMethodology, campaignResearch, campaignStatus, initialAssessments } from "@/lib/seo-campaign";

export function KeywordRegister() {
  const keywords = [...campaignKeywords].sort((a, b) => (a.priority === b.priority ? a.id - b.id : a.priority === "عالية" ? -1 : 1));
  return <div className="seo-research-register">
    <p>{campaignMethodology}</p>
    <p><strong>{campaignResearch.originalSearches.length} بحثًا أصليًا · {campaignKeywords.length} عبارة مختارة · 20 مقالًا إضافيًا</strong></p>
    <p>المراجعة: <time dateTime="2026-10-21">21 أكتوبر 2026</time>. السوق المستهدف السعودية؛ مصدر البحث غير محدد جغرافيًا. الأولويات أدناه توصيات قابلة للتعديل بعد الإطلاق.</p>
    {keywords.map((keyword) => {
      const original = initialAssessments.find((r) => r.id === keyword.id)!;
      const trail = campaignResearch.originalSearches.find((r) => r.id === keyword.id)!;
      return <details key={keyword.id} className="seo-keyword" id={`keyword-${keyword.id}`}>
        <summary><span>{keyword.id}. {keyword.phrase}</span><span className="seo-keyword-badges"><Badge variant="secondary">أولوية {keyword.priority}</Badge><Badge variant="outline">{keyword.intent}</Badge></span></summary>
        <div className="seo-keyword-body">
          <dl className="seo-research-facts">
            <div><dt>الجمهور والمجموعة</dt><dd>{keyword.audience} · {keyword.cluster}</dd></div>
            <div><dt>الثقة في التقدير</dt><dd>{keyword.confidence} — حجم البحث: {keyword.volume}؛ صعوبة رقمية: {keyword.difficulty}</dd></div>
            <div><dt>الصيغة الملحوظة للنتائج</dt><dd>{keyword.format}</dd></div>
            <div><dt>دليل الطلب وحدوده</dt><dd>{keyword.demandEvidence}</dd></div>
            <div><dt>قوة المنافسة الظاهرة</dt><dd>{keyword.competitionRationale}</dd></div>
            <div><dt>فرصة المحتوى المقترحة</dt><dd>{keyword.opportunity}</dd></div>
            <div><dt>الوجهة الأساسية</dt><dd><Link href={keyword.target}><bdi>{keyword.target}</bdi></Link></dd></div>
            <div><dt>المصدر والتاريخ</dt><dd>{keyword.source} · <time dateTime={keyword.researchDate}>{keyword.researchDate}</time></dd></div>
          </dl>
          <p className="seo-source-links">الصفحة المفحوصة: <a href={keyword.reviewedSource.url} target="_blank" rel="noopener noreferrer">{keyword.reviewedSource.title}</a></p>
          <ul className="seo-source-links" aria-label="عينة النتائج المرصودة">{keyword.sources.map((source, i) => <li key={`${source.url}-${i}`}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
          <details className="seo-research-trail"><summary>البحث الأصلي وسبب الاحتفاظ به أو تغييره</summary>
            <p><strong>{original.query}</strong> · {original.date}</p>
            <p>{original.intent} · {original.audience} · {original.format}</p>
            <p>{original.observations}</p><p>{original.strength}</p><p>{original.gap}</p><p>{original.decision}</p>
            <p>{original.inspection}</p>
            {original.reviewedSource && <p className="seo-source-links"><a href={original.reviewedSource.url} target="_blank" rel="noopener noreferrer">{original.reviewedSource.title}</a></p>}
            <ul className="seo-source-links">{trail.results.map((source, i) => <li key={`${source.url}-${i}`}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
          </details>
        </div>
      </details>;
    })}
  </div>;
}

type CampaignRecord = { id: string; title: string; slug: string; revision: number };
export function CampaignArticles({ drafts, publications, error }: { drafts: CampaignRecord[]; publications: CampaignRecord[]; error: boolean }) {
  return <div className="seo-campaign-list">
    <p>حملة من {campaignBriefs.length} مقالًا جديدًا. المنشور حاليًا: {error ? "تعذر التحقق" : publications.length}. الحالة تُقرأ من سجلات المقالات ونسخ النشر، ولا تُستنتج من ملفات الاستيراد.</p>
    {campaignBriefs.map((brief) => {
      const draft = drafts.find((d) => d.id === brief.id);
      const publication = publications.find((p) => p.id === brief.id);
      const primary = campaignKeywords.find((k) => k.id === brief.primaryKeywordId)!;
      const supporting = campaignKeywords.filter((k) => brief.keywordIds.includes(k.id) && k.id !== primary.id);
      return <Card key={brief.id}>
        <CardHeader><CardDescription>{error ? "تعذر التحقق من الحالة" : campaignStatus(draft, publication)}</CardDescription><CardTitle>{publication?.title ?? draft?.title ?? brief.title}</CardTitle></CardHeader>
        <CardContent><p>{brief.question}</p><p>العبارة الأساسية: <a href={`#keyword-${primary.id}`}>{primary.phrase}</a></p>
          {supporting.length > 0 && <p>عبارات مساندة: {supporting.map((k) => k.phrase).join(" · ")}</p>}
          <p>المراجعة التالية المخططة: <time dateTime={brief.reviewDue}>{brief.reviewDue}</time></p>
          <p className="seo-source-links">{publication && <Link href={`/articles/${encodeURIComponent(publication.slug)}`}>افتح المقال المنشور</Link>}{draft && <Link href={`/board/articles/${brief.id}/edit`}>افتح المحرر</Link>}<Link href={`/solutions/${brief.solution}`}>الحل المرتبط</Link></p>
        </CardContent>
      </Card>;
    })}
  </div>;
}
