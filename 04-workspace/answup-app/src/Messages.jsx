import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";

/* One chat thread between Answup (admin) and a client.
   - Client side: <Messages clientId={client.id} me="client" />
   - Admin side:  <Messages clientId={row.id} me="admin" compact />
   Realtime via Supabase channels, falls back to refetch-on-send. */
export default function Messages({ clientId, me, compact = false, title }) {
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  // mark the OTHER side's messages as read (I'm looking at them now)
  const markRead = () =>
    supabase.from("messages").update({ read: true })
      .eq("client_id", clientId).eq("sender", me === "admin" ? "client" : "admin").eq("read", false)
      .then(() => {});

  const load = () =>
    supabase.from("messages").select("*").eq("client_id", clientId).order("created_at", { ascending: true }).limit(200)
      .then(({ data }) => { setMsgs(data || []); markRead(); });

  useEffect(() => {
    if (!clientId) return;
    load();
    const ch = supabase
      .channel(`msgs-${clientId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` },
        (payload) => {
          setMsgs((m) => (m || []).some((x) => x.id === payload.new.id) ? m : [...(m || []), payload.new]);
          if (payload.new.sender !== me) markRead();
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [clientId]);

  // scroll ONLY the message list to its bottom — touching scrollIntoView here
  // yanks parent containers (like the admin drawer) down to the chat on open
  useEffect(() => {
    const list = endRef.current?.parentElement;
    if (list) list.scrollTop = list.scrollHeight;
  }, [msgs?.length]);

  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    const { data, error } = await supabase.from("messages")
      .insert({ client_id: clientId, sender: me, body })
      .select().single();
    setBusy(false);
    if (error) { alert("Could not send: " + error.message); return; }
    setMsgs((m) => (m || []).some((x) => x.id === data.id) ? m : [...(m || []), data]);
    setText("");
  };

  const fmt = (iso) => new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className={`msg-wrap ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="msg-head">
          <div className="st-mgr-av">{me === "admin" ? "👤" : "MF"}</div>
          <div>
            <b>{title || "Muhammad Fahad · Answup"}</b>
            <small>{me === "admin" ? "Ask discovery questions, share updates, confirm go-live." : "Your account manager. Ask anything about your AI receptionist."}</small>
          </div>
        </div>
      )}
      <div className="msg-list">
        {!msgs && <div className="msg-hint">Loading conversation…</div>}
        {msgs && msgs.length === 0 && (
          <div className="msg-hint">
            {me === "client"
              ? "No messages yet. Say hi! Tell us how you want your AI to greet callers, what questions it should ask, anything at all. We reply fast."
              : "No messages yet. Send the client their kickoff questions."}
          </div>
        )}
        {(msgs || []).map((m) => (
          <motion.div key={m.id} className={`msg-row ${m.sender === me ? "mine" : ""}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className={`bub ${m.sender === me ? "user" : "ai"}`}>{m.body}</div>
            <small className="msg-time">{m.sender === "admin" ? "Answup" : "Client"} · {fmt(m.created_at)}</small>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="msg-compose">
        <textarea
          className="msg-input" rows={compact ? 2 : 3}
          placeholder={me === "client" ? "Type your message… (e.g. 'Can my AI mention our $89 diagnostic fee?')" : "Message this client…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button className="msg-send" onClick={send} disabled={busy || !text.trim()}>{busy ? "…" : "Send"}</button>
      </div>
    </div>
  );
}
