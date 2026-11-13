This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Production website: [www.narfid.com](https://www.narfid.com/).

Production builds use `https://www.narfid.com` for canonical URLs, social images,
structured data and the sitemap unless `NEXT_PUBLIC_SITE_URL` overrides it.
The Cloudflare production configuration enables indexing for the official site.
`SITE_INDEXING_ENABLED=false` explicitly disables it; local and preview environments
stay excluded. See [the launch guide](docs/seo-launch.ar.md) for verification and
Search Console setup. Run `npm run test:seo:domain` to check these defaults.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy to Cloudflare Workers

Production uses vinext on Workers. `npm run dev` still runs Next.js locally.
Use a Node version supported by the pinned `cf` CLI. For the first deployment,
sign in with `npx cf auth login` and provide a local JSON file containing the
three Supabase bindings declared in `cloudflare.config.ts`. Keep it in `.private/`.
The two `NEXT_PUBLIC_SUPABASE_*` values also need to be available at build time
through `.env.local` or the build environment. Subsequent deployments can reuse
the existing Worker secrets.

```powershell
npm ci
npm run build:vinext
npx cf deploy --prebuilt --dry-run
npx cf deploy --prebuilt --secrets-file .private/cloudflare-migration/secrets.json
$env:AUTH_TEST_BASE_URL = 'https://www.narfid.com'
npm run test:cloudflare:http
```

`npm run start:vinext -- --port 3001` previews the built Worker locally using
the same binding names in an ignored `.dev.vars` file. The build stages board
downloads behind the authenticated API and packs marketing files into groups
for ZIP streaming. Keep that path on Worker-first routing. No Cloudflare Images
binding or shared response cache is required.
