<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules --->

## Brand context — NARFID

Whenever a task requires understanding narfid (نرفد), its nature as a
technology provider, platform offering, Saudi target customers, positioning,
vision, mission, goals, brand personality, voice, content, or commercial model,
read and follow `.agents/skills/narfid/SKILL.md` before making those decisions.

Use the NARFID skill for brand context and messaging. Visual identity remains
in the UI-system skill; for tasks involving both brand content and UI, use
NARFID alongside the UI skills below. Verify current capabilities and proposed
pricing against the sources linked in the skill before making specific claims.

## SEO — research, content and measurement

Before any narfid SEO work, read and follow
`.agents/skills/narfid-seo/SKILL.md`. This includes search and keyword research,
article planning, writing and editing, solution-page SEO copy, metadata,
internal links, technical SEO, `/board/seo`, indexing and search measurement.
For requests about site traffic, acquisition, contact events or SEO performance,
use the skill's live GA4/Search Console workflow and existing authorized board
access before asking the owner for manual reports. Dated snapshots are context,
not a substitute for reading the requested period from the connected services.
Use the existing research for the relevant topic, preserve its evidence and
limitations, and verify current article inventory before creating overlapping
content. Historical campaign counts and research findings are dated context,
not permanent publication status or verified Google Saudi rankings.
When new articles are requested, let the SEO skill choose reuse versus fresh
research, persist new findings in its linked opportunity register, and select
topics across useful audiences and editorial categories. Educational content
must remain useful to managers and staff independently of narfid; use product
links when they naturally help the reader.

## Articles — writing and publishing

Before writing, editing, importing, publishing, or troubleshooting narfid
articles, read and follow `.agents/skills/narfid-articles/SKILL.md`. For article
planning, writing and editing, also use `.agents/skills/narfid-seo/SKILL.md`,
alongside the NARFID brand skill when brand context is needed. Reuse the existing
editor, validation, media, and publication workflow. For ordinary content
work, use its content-only path and focused verification; do not repeat
the site-wide SEO setup or rebuild article infrastructure.

## Social media — publishing

Before publishing or verifying a batch of narfid posts on Instagram or X, read
`.agents/skills/narfid-social-publishing/SKILL.md` for the local Computer Use
workflow and the steps to verify and record each live post in the marketing
board. This skill and its credentials are local to the owner's workspace.

## UI components

Before adding, editing, styling, or composing UI components,
read and follow `.agents/skills/shadcn/SKILL.md`.

Prefer existing shadcn components before creating custom UI.

Before creating or changing UI, read and follow
`.agents/skills/UI-system/SKILL.md` alongside the shadcn skill.

## Imagery — Saudi audience

People are welcome in website, article and marketing imagery. When people are
shown, choose an Arab appearance appropriate for the Saudi audience and modest
clothing suited to the context. This is not a ban on people: keep human scenes
where they help the topic, rather than replacing all of them by default.
If no suitable human image is available, use relevant sports venues, interiors,
equipment or objects. Check backgrounds and reflections too.
Do not infer or claim a stock model's actual nationality from appearance, or
present stock or generated scenes as real narfid customers.

## Board access for verification

Use the chairman account (رئيس مجلس الإدارة), `chairman@nerfed.example`,
when a task requires signing in to inspect or verify the board. The owner has
authorized using this account for that purpose. Read its password locally from
`.private/board-accounts.md`; account definitions are in
`lib/auth/board-accounts.ts`. Keep passwords out of tracked files and tool output.

## Delivery — commit and push

The owner wants completed work in `narfid` committed and pushed to the current
branch's configured upstream after the relevant checks, without asking for
confirmation again. Include related work from the ongoing session that has not
yet been committed. Inspect the diff before staging; keep credentials, `.env*`,
`.private`, test output and generated archives out of Git. Preserve unrelated
user edits. Use a normal push; resolve a rejected push without force-pushing
or discarding history, and report any unresolved blocker clearly.
