import keywordData from "@/content/seo-campaign/keywords.json";
import briefData from "@/content/seo-campaign/briefs.json";
import researchData from "@/content/seo-campaign/research-log.json";
import initialData from "@/content/seo-campaign/initial-assessments.json";

export type ResearchSource = { title: string; url: string };
export type CampaignKeyword = {
  id: number; phrase: string; cluster: string; audience: string; intent: string;
  priority: string; confidence: string; demandEvidence: string;
  competitionRationale: string; opportunity: string; target: string;
  format: string; reviewedSource: ResearchSource; sources: ResearchSource[];
  researchDate: string; source: string; volume: string; difficulty: string;
};
export type CampaignBrief = {
  id: string; slug: string; title: string; question: string; keywordIds: number[];
  primaryKeywordId: number; solution: string; cover: string; excerpt: string; reviewDue: string;
};
export const campaignKeywords: CampaignKeyword[] = keywordData;
export const campaignBriefs: CampaignBrief[] = briefData;
export const campaignResearch = researchData;
export const initialAssessments = initialData;
export const campaignReviewedAt = "2026-10-21";
export const campaignMethodology = "بُحثت كل عبارة أصلية منفردة عبر بحث الويب، ثم بُحثت الصيغ البديلة. النتائج عينة وقتية وليست ترتيب Google السعودية. الطلب مقدّر من ملاءمة النتائج فقط؛ أحجام البحث وصعوبة الكلمات غير متاحة. الأولوية تجمع الصلة بالمنتج والنية وفائدة المحتوى، والثقة تصف قوة الدليل المتاح. نقاط القوة والفجوات استنتاجات تحريرية وليست أسباب ترتيب مثبتة.";

export function campaignStatus(
  draft: { revision: number; slug: string } | undefined,
  publication: { revision: number; slug: string } | undefined,
) {
  if (publication) return draft && draft.revision !== publication.revision
    ? "منشور — توجد نسخة أحدث في المحرر" : "منشور";
  return draft ? "غير منشور" : "لم يُنشأ";
}
