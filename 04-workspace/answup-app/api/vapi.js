// Vapi end-of-call webhook -> Supabase, WITHOUT the service-role key.
// Writes go through the vapi_ingest() SECURITY DEFINER function, which is
// guarded by VAPI_INGEST_SECRET (set in Vercel). The anon key below is the
// same public key the frontend ships with.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tfuszoexspoqcowawidm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kA9yaJIzCtwRiE9YlkA65g_4TobJAqs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const msg = req.body?.message;
  if (!msg || msg.type !== "end-of-call-report") {
    return res.status(200).json({ ok: true, ignored: msg?.type || "no message" });
  }

  try {
    const meta = msg.assistant?.metadata || msg.call?.assistantOverrides?.metadata || {};
    const clientId = meta.clientId || meta.client_id || process.env.DEFAULT_CLIENT_ID;
    if (!clientId) return res.status(200).json({ ok: false, reason: "no clientId metadata on assistant" });

    const sd = msg.analysis?.structuredData || {};
    const summary = msg.analysis?.summary || msg.summary || null;

    const rawMsgs = msg.artifact?.messages || msg.messages || [];
    const transcript = rawMsgs
      .filter((m) => ["assistant", "bot", "user", "customer"].includes(m.role) && (m.message || m.content))
      .map((m) => ({ who: ["user", "customer"].includes(m.role) ? "user" : "ai", t: m.message || m.content }));

    const isEmergency = /emergen|urgent|leak|no heat|no ac|flood|gas/i.test(
      `${sd.urgency || ""} ${sd.issue || ""} ${summary || ""}`
    );
    const phone = sd.phone || sd.phone_number || sd.callback_number || msg.call?.customer?.number || null;

    let score = 40;
    if (phone) score += 30;
    if (sd.address || sd.service_address) score += 15;
    if (sd.name || sd.customer_name) score += 5;
    if (isEmergency) score += 9;

    const row = {
      client_id: clientId,
      caller_name: sd.name || sd.customer_name || null,
      caller_phone: phone,
      caller_address: sd.address || sd.service_address || null,
      issue: sd.issue || sd.problem || sd.reason || null,
      trade: sd.trade || null,
      urgency: isEmergency ? "emergency" : phone ? "new_lead" : "normal",
      summary,
      transcript,
      recording_url: msg.artifact?.recordingUrl || msg.recordingUrl || null,
      duration_seconds: Math.round(msg.durationSeconds || msg.call?.durationSeconds || 0),
      score: Math.min(99, score),
      vapi_call_id: msg.call?.id || null,
    };

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.rpc("vapi_ingest", { s: process.env.VAPI_INGEST_SECRET, r: row });
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("vapi webhook error", e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
