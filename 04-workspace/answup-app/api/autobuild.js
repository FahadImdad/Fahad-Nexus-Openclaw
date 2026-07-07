// POST /api/autobuild — builds the client's Vapi assistant AUTOMATICALLY right
// after onboarding. Auth = the client's own Supabase session token (no service
// keys anywhere). Idempotent: returns the existing assistant if already built.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tfuszoexspoqcowawidm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kA9yaJIzCtwRiE9YlkA65g_4TobJAqs";

const buildPrompt = (c) => `You are Ava, the warm, capable receptionist for ${c.business_name}, a US ${c.trade || "home services"} company${c.service_area ? ` serving ${c.service_area}` : ""}. YOU handle the entire call and capture accurate details so the team can follow up fast. Sound like a real, caring human, never robotic.

=== LANGUAGE ===
- Greet in English. Detect the caller's language and continue the whole call naturally in THAT language.

=== SOUND HUMAN ===
- Warm, natural, casual touches: "Oh no, sorry to hear that", "Gotcha", "Perfect", "No problem". React like a real person, especially in an emergency. Vary your wording.

=== CAPTURE, in order (confirm each ONCE, smoothly) ===
1. PROBLEM: what they need. Acknowledge warmly.
2. URGENCY: if it sounds like an emergency, reassure them it will be prioritized.
3. NAME: get it. If uncommon or unclear, ask them to spell it.
4. ADDRESS: street and city. Repeat it back once to confirm.
5. CALLBACK NUMBER: digit by digit, confirm once.

=== RULES ===
- Never quote exact prices. Say the team will confirm pricing on the callback.
- Never promise an exact arrival time. Offer that the team will confirm the slot.
- If asked something you don't know, say you'll note it for the team.
- Keep the call efficient: under 4 minutes.
${c.notes ? `\n=== OWNER NOTES (follow these) ===\n${c.notes}\n` : ""}
=== CLOSE ===
- Recap: problem, name, address, number. Tell them the team will call back shortly. Warm goodbye.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.VAPI_PRIVATE_KEY;
  if (!key) return res.status(200).json({ ok: false, reason: "VAPI_PRIVATE_KEY not configured yet" });

  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "missing auth token" });

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await sb.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return res.status(401).json({ error: "invalid token" });

    // Admins can trigger a build for any client (drawer button); clients build their own
    const ADMIN_EMAILS = ["fahadimdad966@gmail.com", "admin@answup.com"];
    const clientId = req.body?.clientId;
    let q = sb.from("clients").select("*");
    if (clientId) {
      if (!ADMIN_EMAILS.includes(user.email)) return res.status(403).json({ error: "admins only" });
      q = q.eq("id", clientId);
    } else {
      q = q.eq("user_id", user.id);
    }
    const { data: client } = await q.single();
    if (!client) return res.status(404).json({ error: "no client profile" });
    if (client.vapi_assistant_id)
      return res.status(200).json({ ok: true, assistantId: client.vapi_assistant_id, existing: true });

    const firstMessage =
      (client.greeting && client.greeting.trim()) ||
      `Thanks for calling ${client.business_name}! This is Ava. How can I help you today?`;

    const assistant = {
      name: `Answup — ${client.business_name}`.slice(0, 40),
      firstMessage,
      model: {
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        messages: [{ role: "system", content: buildPrompt(client) }],
      },
      voice: {
        provider: "11labs", voiceId: "sarah", model: "eleven_turbo_v2_5",
        stability: 0.5, similarityBoost: 0.75, useSpeakerBoost: true, optimizeStreamingLatency: 3,
      },
      transcriber: { provider: "deepgram", model: "nova-3", language: "multi", numerals: true, smartFormat: true },
      startSpeakingPlan: { waitSeconds: 0.4, smartEndpointingPlan: { provider: "livekit", waitFunction: "500 + 2500 * x" } },
      server: { url: "https://answup.com/api/vapi" },
      metadata: { clientId: client.id },
      maxDurationSeconds: 240, // capped until they pay and go live
      analysisPlan: {
        summaryPlan: {
          enabled: true,
          messages: [
            { role: "system", content: "Summarize this call in 1-2 short sentences for the business owner: who called, what they need, urgency, and that a callback is needed. Be concise and factual." },
            { role: "user", content: "Here is the transcript:\n\n{{transcript}}\n\n. Here is the ended reason of the call:\n\n{{endedReason}}\n\n" },
          ],
        },
        structuredDataPlan: {
          enabled: true,
          schema: {
            type: "object",
            required: ["problem", "urgency", "caller_name", "phone_number"],
            properties: {
              problem: { type: "string", description: "Short description of what the caller needs." },
              urgency: { type: "string", description: "emergency or normal" },
              caller_name: { type: "string", description: "The caller's name." },
              phone_number: { type: "string", description: "The callback number the caller provided." },
              address: { type: "string", description: "The service address provided by the caller, including street and city if given." },
            },
          },
        },
      },
    };

    const r = await fetch("https://api.vapi.ai/assistant", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(assistant),
    });
    const created = await r.json();
    if (!r.ok) return res.status(200).json({ ok: false, reason: created?.message || "vapi rejected the assistant" });

    await sb.from("clients").update({ vapi_assistant_id: created.id, updated_at: new Date().toISOString() }).eq("id", client.id);
    return res.status(200).json({ ok: true, assistantId: created.id });
  } catch (e) {
    console.error("autobuild error", e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
