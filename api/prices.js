// POST /api/prices
// Body: { items: [{key, name, need, qty, unit}] }
// Returns: { prices: [{key, price, pack, pantry, need}] }
// Estimation statique basée sur les prix Magasins U (table lib/ingredients.js)

'use strict';

const { findIngredient } = require('../lib/ingredients');

// Conversion en unité de base (g, ml, pièce)
function toBase(qty, unit) {
  if (qty == null || isNaN(qty)) return { q: null, u: unit };
  const u = (unit || "").trim().toLowerCase();
  if (u === "kg")  return { q: qty * 1000, u: "g" };
  if (u === "cl")  return { q: qty * 10,   u: "ml" };
  if (u === "l")   return { q: qty * 1000, u: "ml" };
  return { q: qty, u };
}

function estimatePrice(name, qty, unit) {
  const data = findIngredient(name);
  if (!data) return null;

  // Convertir la quantité nécessaire en unité de base
  const { q: neededQ, u: neededU } = toBase(qty, unit);
  const { q: packQ, u: packU }     = toBase(data.qty, data.unit);

  if (neededQ == null || packQ == null || packQ === 0) {
    // Quantité inconnue ou article à l'unité → 1 paquet
    return { price: data.price, pack: data.pack, pantry: data.pantry };
  }

  // Vérifier que les unités sont compatibles
  if (neededU !== packU && neededU !== "" && packU !== "") {
    // Unités incompatibles (ex. besoin en pièces, table en grammes) → 1 paquet
    return { price: data.price, pack: data.pack, pantry: data.pantry };
  }

  // Calculer le nombre de paquets nécessaires
  const packs = Math.max(1, Math.ceil(neededQ / packQ));
  const totalPrice = Math.round(packs * data.price * 100) / 100;
  const packDesc = packs > 1 ? `${data.pack} × ${packs}` : data.pack;
  return { price: totalPrice, pack: packDesc, pantry: data.pantry };
}

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

  const items = Array.isArray(body?.items) ? body.items : [];
  const prices = [];

  for (const item of items) {
    const { key, name, need, qty, unit } = item || {};
    if (!key || !name) continue;

    const est = estimatePrice(String(name).toLowerCase(), qty, unit || "");
    if (est) {
      prices.push({ key, price: est.price, pack: est.pack, pantry: est.pantry, need: need || "" });
    } else {
      prices.push({ key, price: null, pack: null, pantry: false, need: need || "" });
    }
  }

  res.status(200).json({ prices });
};
