// POST /api/import
// Body: { url?: string, text?: string }
// Returns: { title, servings, ingredients: [{name, qty, unit, cat}] }
//
// Flux :
//   1. Si URL → tenter schema.org JSON-LD (gratuit, 0 crédit)
//   2. Si pas de schema.org → Firecrawl (1 crédit, plafonné à 20/jour)
//   3. Si texte brut → parser rule-based directement
//   Dans tous les cas, le parsing {name,qty,unit,cat} est rule-based (lib/parser.js)

'use strict';

const { parseBlock } = require('../lib/parser');

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FC_KEY        = process.env.FIRECRAWL_API_KEY;
const FC_DAILY_MAX  = 20; // crédits max par jour pour rester dans 1000/mois

// ── Helpers Supabase ─────────────────────────────────────────────────────────

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
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

async function checkFcQuota() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return true; // pas de Supabase → autoriser
  const today = new Date().toISOString().slice(0, 10);
  try {
    const rows = await sbFetch(`fc_usage?date=eq.${today}&select=count`);
    const count = rows && rows[0] ? rows[0].count : 0;
    return count < FC_DAILY_MAX;
  } catch { return true; }
}

async function incrementFcQuota() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const today = new Date().toISOString().slice(0, 10);
  try {
    await sbFetch(`fc_usage?date=eq.${today}`, {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ date: today, count: 1 }),
    });
    // Si la ligne existait déjà, l'incrémenter via RPC (défini dans schema.sql)
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_fc`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_date: today }),
    });
  } catch { /* silencieux */ }
}

// ── Schema.org JSON-LD ───────────────────────────────────────────────────────

function extractJsonLd(html) {
  const matches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of matches) {
    try {
      const obj = JSON.parse(m[1].trim());
      const nodes = obj["@graph"] ? obj["@graph"] : [obj];
      for (const node of nodes) {
        if (node && (node["@type"] === "Recipe" || (Array.isArray(node["@type"]) && node["@type"].includes("Recipe")))) {
          return node;
        }
      }
    } catch { /* JSON invalide */ }
  }
  return null;
}

function servingsFromText(text) {
  if (!text) return 4;
  const n = parseInt(String(text).replace(/\D.*$/, ""), 10);
  return isNaN(n) || n < 1 ? 4 : n;
}

function cleanTitle(raw) {
  if (!raw) return "Recette sans nom";
  // Garder uniquement ce qui précède le premier séparateur de type " : ", " | ", " - ", " – "
  const t = String(raw).trim();
  const sep = t.search(/\s+[:\|\-–]\s+/);
  return (sep > 0 ? t.slice(0, sep) : t).trim().slice(0, 80) || "Recette sans nom";
}

// ── Firecrawl ────────────────────────────────────────────────────────────────

async function firecrawlScrape(url) {
  if (!FC_KEY) throw new Error("FIRECRAWL_API_KEY non configurée");
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { "Authorization": `Bearer ${FC_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      formats: ["json"],
      onlyMainContent: true,
      jsonOptions: {
        prompt: "Extrais la recette : son titre exact, le nombre de personnes prévu, et la liste des ingrédients telle qu'écrite sur la page (chacun avec sa quantité et son unité si mentionnées). Ne reformule pas — copie les lignes d'ingrédients.",
        schema: {
          type: "object",
          properties: {
            title:       { type: "string" },
            servings:    { type: "number" },
            ingredients: { type: "array", items: { type: "string" } }
          },
          required: ["title", "ingredients"]
        }
      }
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firecrawl ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const json = data?.data?.json || data?.json || null;
  return json;
}

// ── Handler principal ────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return res.status(400).json({ error: "Corps JSON invalide" });
  }

  const { url, text } = body || {};

  // ── Cas 1 : texte brut fourni directement ────────────────────────────────
  if (!url && text) {
    const lines = text.split(/\n/).filter(l => l.trim());
    // Essayer de détecter un titre (première ligne sans quantité ni unité)
    let title = "Recette sans nom";
    let startIdx = 0;
    if (lines[0] && !lines[0].match(/^\d/) && lines[0].length < 80) {
      title = lines[0].trim();
      startIdx = 1;
    }
    // Trouver le nombre de personnes
    let servings = 4;
    const servLine = text.match(/pour\s+(\d+)\s+(?:personne|convive|part)/i);
    if (servLine) servings = parseInt(servLine[1], 10);

    const ingredients = parseBlock(lines.slice(startIdx).join("\n"));
    if (!ingredients.length) return res.status(422).json({ code: "no_ingredients", error: "Aucun ingrédient trouvé dans le texte." });
    return res.status(200).json({ title, servings, ingredients });
  }

  if (!url) return res.status(400).json({ error: "url ou text requis" });

  // ── Cas 2 : URL fournie → schema.org d'abord ────────────────────────────
  let title = "Recette sans nom";
  let servings = 4;
  let rawIngredients = []; // tableaux de chaînes

  try {
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CoursesSemaine/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const recipe = extractJsonLd(html);
      if (recipe) {
        title = cleanTitle(recipe.name) || title;
        servings = servingsFromText(recipe.recipeYield);
        rawIngredients = (recipe.recipeIngredient || []).map(String).filter(Boolean);
      }
    }
  } catch { /* timeout ou réseau */ }

  // ── Cas 3 : Pas de schema.org → Firecrawl ────────────────────────────────
  if (!rawIngredients.length) {
    const quota = await checkFcQuota();
    if (!quota) {
      return res.status(429).json({
        code: "fc_quota",
        error: "Limite journalière Firecrawl atteinte. Colle le texte de la recette à la place.",
      });
    }
    try {
      const json = await firecrawlScrape(url);
      if (json && Array.isArray(json.ingredients) && json.ingredients.length) {
        title = cleanTitle(json.title) || title;
        servings = json.servings || servings;
        rawIngredients = json.ingredients.map(String).filter(Boolean);
        await incrementFcQuota();
      } else {
        return res.status(422).json({ code: "tool_error", error: "La page n'a pas pu être lue. Colle le texte de la recette." });
      }
    } catch (e) {
      const msg = e && e.message ? e.message : "";
      if (msg.includes("429") || msg.includes("quota")) {
        return res.status(429).json({ code: "fc_quota", error: "Limite Firecrawl atteinte. Colle le texte de la recette." });
      }
      return res.status(422).json({ code: "tool_error", error: "La page n'a pas pu être lue. Colle le texte de la recette." });
    }
  }

  // ── Parser rule-based ─────────────────────────────────────────────────────
  const ingredients = parseBlock(rawIngredients.join("\n"));
  if (!ingredients.length) {
    return res.status(422).json({ code: "no_ingredients", error: "Aucun ingrédient trouvé. Colle le texte de la recette." });
  }

  return res.status(200).json({ title, servings, ingredients });
};
