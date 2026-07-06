# ANSWUP VENDOR PLAYBOOK (automation-first)
Design principle: **the machine does everything; you only touch what a machine can't.**

Your manual work per client is exactly FOUR actions. Everything else happens automatically.

Your tools: **answup.com/admin** (console), **Vapi dashboard** (agents), **Twilio** (numbers, only after payment).

---

## WHAT HAPPENS AUTOMATICALLY (no touch from you)

| Moment | What the machine does |
|---|---|
| Prospect visits answup.com | Demo phone rings, tap plays the Ava call with sound. Sells itself. |
| They sign up + onboard | Account created, client card appears in your Clients board, **auto-accepted straight to Building** (no review click). |
| Instantly after onboarding | **Kickoff questions are auto-sent** in their chat: greeting, services, emergency rules. They answer while you sleep. |
| They finish testing | They click **"It sounds great — activate my receptionist"** on their dashboard → **invoice auto-created** in their Billing with their plan amount. |
| Every call once live | Vapi answers → webhook → lead scored → appears on their dashboard and your All Calls with transcript + recording. Minutes tracked per month automatically. |
| Tracker, statuses, badges | Client always sees the right stage, forwarding steps, unread counts. All automatic. |

## YOUR FOUR MANUAL ACTIONS (per client)

1. **BUILD (~15 min).** Their card says Step 2. Read their chat answers in Inbox. In Vapi: duplicate the trade template, paste their greeting/rules, set `metadata.clientId` = their client ID (shown in drawer), cap call length ~4 min, attach your shared test number (or web call link). Paste assistant ID + test number into the drawer wiring fields. Message them: "Ready — call +1 XXX and meet your receptionist."
2. **TWEAK (minutes, as requested).** They message change requests → you edit the Vapi prompt → reply "done".
3. **CONFIRM PAYMENT (one tick).** Their invoice was auto-created when they clicked Activate. When the bank transfer lands, tick **Client has paid this month** in the drawer. This unlocks Set Live.
4. **GO LIVE (~15 min).** Buy their dedicated Twilio number (~$1.15/mo), point it at their assistant, update the number field in the drawer, click **Set Live**. Their dashboard flips to live stats + forwarding instructions automatically.

## DAILY ROUTINE (5 minutes)
- Open **Inbox**: answer anything. Speed = service quality.
- Glance **All Calls**: every live client should show recent calls. Silence for days = check their forwarding.

## MONTHLY ROUTINE (per client, ~1 minute)
- 1st of month: create next invoice (drawer button), untick paid, message a reminder.
- Paid → tick. A week unpaid → **Pause** (AI stops answering). Reactivate on payment.

---

## AUTOMATION STAGE 2 — BUILT AND DEPLOYED, needs 3 keys to switch on
All code is live. Three one-time pastes by Fahad activate it (security policy forbids the AI from handling these keys):

1. **Auto-build** (assistant creates itself on signup). Get the PRIVATE key at dashboard.vapi.ai → Organization Settings → API Keys. Then in a terminal:
   `cd 04-workspace\answup-app` then `vercel env add VAPI_PRIVATE_KEY production` (paste key when prompted), then `vercel deploy --prod --yes` (or tell Claude to redeploy).
2. **In-browser client test call** ("Call your AI" button). Copy the PUBLIC key from the same Vapi page and paste it between the quotes in `src/lib/vapiWeb.js` (`VAPI_PUBLIC_KEY = "..."`). Publishable by design, safe in code. Rebuild + deploy.
3. **Email alerts** (signup / client message / new call → your inbox). Create a free account at resend.com, copy the API key, then `vercel env add RESEND_API_KEY production` + redeploy. Skippable: without it alerts silently no-op.

- **Auto number provisioning** (Twilio number bought by API when you tick Paid): planned, blocked until Twilio voice verification clears.

## CURRENT TEMPORARY LIMITS
- Twilio voice verification pending: test via web calls until approved.
- Payments are bank transfer: confirming money arrival stays manual by nature (the one tick).

## ECONOMICS PER CLIENT
- Acquire: outreach time + ~50 cents of test minutes.
- Run: ~$0.10-0.15 per answered minute + $1.15/mo number, against $397-1,197/mo revenue.
- Your time: ~30-45 min total from signup to live today; stage 2 automation cuts it to ~10.
