// GET  /api/sync?code=HASH  → renvoie l'état du foyer
// POST /api/sync            → body: {code, data} → sauvegarde et renvoie l'état
// Le code reçu est le SHA-256 hexadécimal du code foyer (calculé côté client)

'use strict';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sbFetch(path, opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${txt}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(503).json({ error: "Base de données non configurée (variables d'environnement manquantes)." });
  }

  // ── GET : charger l'état ─────────────────────────────────────────────────
  if (req.method === "GET") {
    const code = req.query?.code || new URL(req.url, "http://x").searchParams.get("code");
    if (!code || !/^[0-9a-f]{64}$/.test(code)) {
      return res.status(400).json({ error: "Code invalide" });
    }
    try {
      const rows = await sbFetch(`households?code_hash=eq.${code}&select=data,updated_at`);
      if (!rows || !rows.length) {
        return res.status(200).json({ data: null, updated_at: null }); // nouveau foyer
      }
      return res.status(200).json({ data: rows[0].data, updated_at: rows[0].updated_at });
    } catch (e) {
      console.error("sync GET error", e);
      return res.status(500).json({ error: "Erreur base de données" });
    }
  }

  // ── POST : sauvegarder ───────────────────────────────────────────────────
  if (req.method === "POST") {
    let body;
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      return res.status(400).json({ error: "Corps JSON invalide" });
    }
    const { code, data } = body || {};
    if (!code || !/^[0-9a-f]{64}$/.test(code)) {
      return res.status(400).json({ error: "Code invalide" });
    }
    if (data == null || typeof data !== "object") {
      return res.status(400).json({ error: "data manquant" });
    }
    try {
      const now = new Date().toISOString();
      await sbFetch("households", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ code_hash: code, data, updated_at: now }),
      });
      return res.status(200).json({ ok: true, updated_at: now });
    } catch (e) {
      console.error("sync POST error", e);
      return res.status(500).json({ error: "Erreur sauvegarde" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
};
