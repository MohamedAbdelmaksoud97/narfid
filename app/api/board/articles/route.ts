import { articleSession, dbFailure } from "@/lib/articles/server";
import {
  failure,
  json,
  readJson,
  validId,
  verifyMutation,
} from "@/lib/articles/http";
import { EMPTY_DOCUMENT } from "@/lib/articles/types";

export async function POST(request: Request) {
  try {
    verifyMutation(request);
    const { supabase, member } = await articleSession();
    const input = await readJson(request);
    const id = String(input.id);
    validId(id);
    // Idempotent creation makes retrying a lost response safe.
    const existing = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (existing.error) dbFailure(existing.error);
    if (existing.data) return json({ article: existing.data });
    const { data, error } = await supabase
      .from("articles")
      .insert({
        id,
        slug: `article-${id}`,
        author_id: member.id,
        author_name: member.name,
        content: EMPTY_DOCUMENT,
      })
      .select("*")
      .single();
    if (error) dbFailure(error);
    return json({ article: data }, 201);
  } catch (error) {
    return failure(error);
  }
}
