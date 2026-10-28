# ADUNICH Toolkit — Vercel web app

A static frontend (`public/index.html`) backed by serverless API routes
(`/api/*`), rebuilt from the Telegram bot to run on Vercel. Vercel runs
short-lived serverless functions rather than a persistent process, so the
bot's long-polling loop, force-join gate, and Telegram-specific UI don't
carry over — everything else (the prexzyapis.com calls, response parsing,
branding) does.

## Deploy

**Option A — Vercel CLI**
```bash
npm i -g vercel
cd adunich-web
vercel
```
Follow the prompts (link or create a project). Running `vercel` again
redeploys; `vercel --prod` promotes to your production domain.

**Option B — GitHub import**
1. Push this folder to a GitHub repo.
2. On vercel.com → "Add New… → Project" → import the repo.
3. Framework preset: "Other" (no build step needed — it's static HTML +
   `/api` functions, both of which Vercel detects automatically).
4. Deploy.

No environment variables are required — every API route calls
`prexzyapis.com` directly from the serverless function.

## Project structure

```
api/              one serverless function per tool (Node.js, CommonJS)
  detectlang.js
  download.js     the all-in-one link downloader (TikTok/IG/Twitter/FB/Pinterest)
  sounddl.js
  ffstalk.js
  ytstalk.js
  igstalk.js
  mkimage.js
  genimage.js
  randomcar.js
  tiktokgirl.js
  tts-voices.js
  tts.js
  chat.js
lib/helpers.js   shared fetch/parsing helpers used by every route
public/index.html the whole frontend (HTML/CSS/JS in one file)
```

## What's unconfirmed

Same caveats as the bot: `igstalkV2`, `genigpt`, `detectlanguage`, and a
few others returned HTTP 400 on every live test call I made while
building this, so their routes are defensive (generic field-searching,
full error passthrough) rather than built against confirmed response
shapes. `download`, `randomcar`, `tiktokgirl`, and `tts` (with its
per-voice endpoint table) were tested live and confirmed working.

If a route doesn't parse correctly once you test it for real, check the
Vercel function logs (Vercel dashboard → your project → "Logs", or
`vercel logs <url>`) for the raw upstream response, and I can tighten
the parsing the same way we did for the bot.

## What's missing vs. the Telegram bot

- No force-join gate (that's a Telegram-specific concept)
- No admin broadcast (no user list to broadcast to on a stateless site)
- `/genimage`'s "reply to a photo to edit it" flow isn't wired up — the
  web UI only does text-to-image. Image editing would need a file-upload
  input hosted somewhere publicly fetchable, which is a bigger addition;
  say if you want it and I'll add it.
