// POST /api/admin-client — admin-only client operations that need server keys.
// action "delete": removes the client's Vapi assistant, then purges all their
// data + login via the admin_delete_client RPC (which re-checks admin email).
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tfuszoexspoqcowawidm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kA9yaJIzCtwRiE9YlkA65g_4TobJAqs";
const ADMIN_EMAILS = ["fahadimdad966@gmail.com", "admin@answup.com"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "missing auth token" });
  const { action, clientId } = req.body || {};
  if (!clientId) return res.status(400).json({ error: "clientId required" });

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData } = await sb.auth.getUser(token);
    const user = userData?.user;
    if (!user || !ADMIN_EMAILS.includes(user.email)) return res.status(403).json({ error: "admins only" });

    if (action === "delete") {
      const { data: client } = await sb.from("clients").select("id, vapi_assistant_id").eq("id", clientId).single();
      if (!client) return res.status(404).json({ error: "client not found" });

      // clean up their Vapi assistant first (harmless if key missing or already gone)
      if (client.vapi_assistant_id && process.env.VAPI_PRIVATE_KEY) {
        await fetch(`https://api.vapi.ai/assistant/${client.vapi_assistant_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}` },
        }).catch(() => {});
      }

      const { data: ok, error } = await sb.rpc("admin_delete_client", { cid: clientId });
      if (error) throw error;
      return res.status(200).json({ ok: !!ok });
    }

    return res.status(400).json({ error: "unknown action" });
  } catch (e) {
    console.error("admin-client error", e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
