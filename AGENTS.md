# ScoreMax Project Instructions

## Project Type

Web app: Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/Radix UI primitives, Supabase, Stripe, Resend, and Google Calendar.

## Working Rules

- Follow the existing Next.js App Router structure under `src/app`.
- Keep route pages thin and move reusable UI into `src/components`.
- Use `src/components/ui` for UI primitives, `src/lib` for integrations/utilities, and `src/hooks` for shared client hooks.
- Keep TypeScript strict and run `npm run build` plus `npx tsc --noEmit` before calling development work complete.
- Use Tailwind utilities and project tokens; avoid inline CSS unless there is no reasonable alternative.
- Preserve responsive behavior across mobile and desktop.
- Use lucide icons when a standard icon is needed.
- Keep auth, admin, Stripe, and Supabase changes narrowly scoped and verified.
- For database work, use Supabase MCP tools against the verified project. Do not create or apply migration files unless explicitly asked.
- For Supabase database work in this repo, first use Cursor's global Supabase MCP settings, not Codex tool discovery. The repeatable path is `node scripts/cursor-supabase-mcp.mjs ...`, which reads `/Users/tommy/.cursor/mcp.json`, uses the global Supabase MCP server, and defaults to the verified Score Max project ref.
- Verify the Supabase project ref before any database-side action. The local non-secret reference lives in `.codex/supabase-project.md`.
- Do not change Cursor's global Supabase MCP config to a specific project. The MCP is global; pass the Score Max project ref per call.
- Do not copy secrets, service role keys, API keys, or MCP tokens into project-local rule files.
- Do not commit, push, deploy, or change production settings unless explicitly instructed.

## Known Project Notes

- `CLAUDE.md` and `README.md` still describe a mostly fresh starter app and may be stale.
- `supabase/config.toml` is the current local source for the linked Supabase project identity.
