# Board authentication verification — 2026-10-13

## Verified

- Production build passed, including TypeScript and the dynamic `/login` and `/board` routes with Cache Components.
- ESLint passed with no errors or warnings.
- Five authorization tests passed: expected board membership, missing/unrelated users, client-metadata spoofing, revoked membership and lookalike domains.
- HTTP tests on the local production server passed: the landing links to login, anonymous board access redirects to `/login`, private/no-store response headers are applied, an unlisted email is rejected through the real server action, and a fabricated session cookie cannot enter the board.
- The private credential files are ignored by Git. Five distinct cryptographically generated passwords are prepared locally, with 28 characters each.

## Remote provisioning completed

The user supplied the server-only admin key and explicitly requested saving it to `.env.local`. The file remains ignored by Git; the key was not printed in command output or added to application source.

`npm run auth:bootstrap` created all five users in the configured Supabase project and verified each through real password sign-in/sign-out requests. The private credential files now mark every account `verified`.

The HTTP integration test passed real successful login, HttpOnly/SameSite session cookies, protected board rendering and logout. Anonymous and fabricated sessions remained denied. An incorrect password for a real board account was rejected without establishing a session.

Supabase SDK initialization is explicitly deferred to request time with `connection()`. This resolves Next Cache Components clock-access errors observed during authenticated prerender attempts. The final production build, lint and all seven HTTP checks passed after the fix, and the production server log remained clean.

No messages or confirmation emails were sent. No public sign-up flow was added. No custom SQL or schema migration was applied; Supabase Auth uses its managed Postgres auth schema.
