# Nerved / نرفد — Board authentication

## Scope

Email/password login for five pre-provisioned board accounts. No sign-up UI, public account creation action, OAuth flow or password recovery email flow was added. The landing page links to `/login`; authorized users enter `/board`. A shared workspace layout provides persistent navigation for the overview, brand reference, article list and article editor.

Supabase Auth stores the users, password hashes, sessions and administrator-managed membership in its managed Postgres `auth` schema. A separate public profile table is not needed for this stage. No custom SQL or database migration was applied.

## Five virtual accounts

All five accounts have been provisioned and their passwords verified against Supabase. The local private handover files show status `verified`.

- `chairman@nerfed.example`
- `operations@nerfed.example`
- `finance@nerfed.example`
- `technology@nerfed.example`
- `strategy@nerfed.example`

These are virtual login identifiers, not working email inboxes. The reserved `.example` domain avoids using someone else's real mailbox/domain. Admin creation auto-confirms the accounts without sending messages.

## Provisioning

Existing public configuration: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Add `SUPABASE_SECRET_KEY` to `.env.local` from this project's Supabase API Keys. A server-only legacy `SUPABASE_SERVICE_ROLE_KEY` is also accepted. Never use a `NEXT_PUBLIC_` prefix for the admin key.

Run `npm run auth:bootstrap` (Node 24). The script generates five independent cryptographic passwords, creates users with `auth.admin.createUser`, sets `app_metadata.narfid_board_member = true`, and verifies each password through real sign-in/sign-out requests. It reuses its private credential file and never silently resets an existing user's password. It refuses to take over a conflicting existing account.

Private handover files:

- `.private/board-accounts.md`
- `.private/board-accounts.json`

The `.private` directory is ignored by Git and is outside `public`. Passwords/admin keys are never put in source files, browser bundles, application logs or this documentation. `pending` means the account has not been created; `verified` means remote creation and login verification succeeded.

## Authorization and sessions

- The proxy verifies signed JWT claims and refreshes Supabase SSR cookies.
- The board layout and protected pages call `getUser()` to read live Auth user data and check the exact five-email allowlist plus the admin-controlled membership flag. Article access also checks its active database membership, as documented in `article-editor.md`.
- An authenticated user outside the board list cannot enter the board page. User-editable `user_metadata` cannot grant access.
- Removing the membership flag blocks subsequent server checks.
- Cookies are HttpOnly, SameSite=Lax and Secure in production. The board login uses server actions; it does not depend on browser access to Supabase auth cookies.
- Authenticated responses and redirects use private/no-store headers. Session reads are behind Suspense boundaries for Next Cache Components and are not shared server cache entries.
- Next Server Actions supply same-origin CSRF validation. Login errors do not reveal whether an account exists. Provider rate-limit errors are displayed safely.
- Logout signs out the local session, clears its cookies and redirects to `/login`.
- There is no signup route. Dashboard-level Supabase public sign-up settings are not changed by this script; administrator-controlled board membership remains required even if that API is enabled.

For future sections, call `requireBoardMember()` inside every sensitive server action/data accessor, not only in a surrounding layout.

## Shared board workspace

`app/board/layout.tsx` authenticates the member behind Suspense and renders `components/board/board-shell.tsx`. The shared layout remains mounted while its child pages change. The public site and login remain outside it.

- The right sidebar contains overview, brand and articles, with an active link that includes nested editor routes.
- The sticky navbar shows the current section, breadcrumbs, account context, public-site link and logout.
- The desktop sidebar collapses to icons. Its UI preference is stored in `nerved_board_sidebar`, scoped to `/board` with SameSite=Lax and Secure on HTTPS; it has no authentication authority.
- Mobile navigation uses the shadcn Base UI Sheet, with an Arabic title, focus management, Escape/close controls and automatic closing after navigation.
- The sidebar uses Ctrl/⌘+\\, leaving Ctrl/⌘+B to editor formatting. Already-handled keyboard events are respected.
- Unsaved article edits retain their existing link/history guards. Logout also consults the same active draft guards before submitting its server action.
- Container queries adapt editor settings and the brand index to the width available after the sidebar, including tablet widths.

The official `@shadcn/sidebar` registry supplied Sidebar, Sheet, Tooltip, Skeleton and the mobile hook. Existing Button/Input/Separator files were preserved. The mobile hook uses `useSyncExternalStore` for the current React rules.

`tests/browser/board-layout.spec.ts` checks actual login, persistent layout DOM, active routes, collapsed state across navigation/reload, editor shortcuts, canceling logout with unsaved edits, mobile navigation at 390px, no overflow at 768/1024px, and anonymous protection after logout and browser back. It cleans up only the draft it creates. Screenshots are local in `.private/board-layout-qa`.

## Checks

- `npm run test:auth`: five authorization tests, including metadata spoofing, revoked membership and domain lookalikes.
- `npm run test:auth:http`: local production server on port 3012 by default; override with `AUTH_TEST_BASE_URL`. Checks public access, anonymous/forged-session rejection and the server login action. Successful login/logout checks run only after provisioning.
- `npm run lint` and `npm run build` validate the Next implementation.

## Official references

- [Supabase SSR setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Admin user creation](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [Password authentication](https://supabase.com/docs/guides/auth/passwords)
- [User storage in the Auth schema](https://supabase.com/docs/guides/auth/managing-user-data)
