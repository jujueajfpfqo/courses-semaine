// Parser rule-based pour les lignes d'ingrédients en français
// Entrée : "600 g de blanc de poulet" → {name, qty, unit, cat}

'use strict';

const { findIngredient, NOISE_WORDS } = require('./ingredients');

// Unités reconnues (ordre : les plus longues d'abord pour éviter les ambiguïtés)
const UNIT_MAP = {
  "cuillère à soupe":  "c. à soupe",
  "cuillères à soupe": "c. à soupe",
  "cuillerée à soupe": "c. à soupe",
  "c. à soupe":        "c. à soupe",
  "c.à soupe":         "c. à soupe",
  "c à soupe":         "c. à soupe",
  "cas":               "c. à soupe",
  "cuillère à café":   "c. à café",
  "cuillères à café":  "c. à café",
  "cuillerée à café":  "c. à café",
  "c. à café":         "c. à café",
  "c.à café":          "c. à café",
  "c à café":          "c. à café",
  "cac":               "c. à café",
  "pincée":            "pincée",
  "pincées":           "pincée",
  "kilogramme":        "kg",
  "kilogrammes":       "kg",
  "kg":                "kg",
  "grammes":           "g",
  "gramme":            "g",
  "gr":                "g",
  "g":                 "g",
  "litres":            "l",
  "litre":             "l",
  "l":                 "l",
  "centilitres":       "cl",
  "centilitre":        "cl",
  "cl":                "cl",
  "millilitres":       "ml",
  "millilitre":        "ml",
  "ml":                "ml",
};

// Mots de liaison entre l'unité et le nom
const DE_RE = /^(?:de\s+la?\s+|d['']|du\s+|des\s+|de\s+)/i;

// Fractions françaises courantes
const FRACTIONS = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1/3, "⅔": 2/3 };

function parseFraction(s) {
  for (const [sym, val] of Object.entries(FRACTIONS)) {
    if (s.includes(sym)) return { val, rest: s.replace(sym, "").trim() };
  }
  // 1/2, 3/4...
  const m = s.match(/^(\d+)\s*\/\s*(\d+)/);
  if (m) return { val: Number(m[1]) / Number(m[2]), rest: s.slice(m[0].length).trim() };
  return null;
}

function parseQty(s) {
  s = s.trim();
  // Fraction seule : "½ oignon"
  const frac = parseFraction(s);
  if (frac) return { qty: frac.val, rest: frac.rest };
  // Nombre + fraction : "1 ½ oignon"
  const numFrac = s.match(/^(\d+(?:[.,]\d+)?)\s*([½¼¾⅓⅔])/);
  if (numFrac) {
    const whole = Number(numFrac[1].replace(",", "."));
    const f = FRACTIONS[numFrac[2]] || 0;
    return { qty: whole + f, rest: s.slice(numFrac[0].length).trim() };
  }
  // Nombre simple ou décimal
  const num = s.match(/^(\d+(?:[.,]\d+)?)/);
  if (num) return { qty: Number(num[1].replace(",", ".")), rest: s.slice(num[0].length).trim() };
  return { qty: null, rest: s };
}

// Construit un regex pour matcher une unité (permet des variantes d'espacement)
function buildUnitRegex() {
  const sorted = Object.keys(UNIT_MAP).sort((a, b) => b.length - a.length);
  const escaped = sorted.map(u => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"));
  return new RegExp("^(" + escaped.join("|") + ")\\b", "i");
}
const UNIT_RE = buildUnitRegex();

function parseUnit(s) {
  const m = s.match(UNIT_RE);
  if (!m) return { unit: "", rest: s };
  const matched = m[1].toLowerCase().replace(/\s+/g, " ");
  const norm = UNIT_MAP[matched] || "";
  return { unit: norm, rest: s.slice(m[0].length).trim() };
}

function cleanName(raw) {
  let n = raw
    .replace(DE_RE, "")        // retirer "de la", "d'", "du", "des"
    .trim()
    .toLowerCase();

  // Retirer les mots parasites en fin de nom
  for (const w of NOISE_WORDS) {
    const re = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
    n = n.replace(re, " ");
  }

  // Retirer les parenthèses et leur contenu : "oignon (rouge)" → "oignon"
  n = n.replace(/\s*\([^)]*\)/g, "");
  // Supprimer les virgules et ce qui suit
  n = n.split(",")[0];
  // Nettoyer les espaces multiples
  n = n.replace(/\s{2,}/g, " ").trim();

  // Dé-pluraliser les noms simples (s ou x finaux)
  n = n.replace(/\b(\w{3,})[sx]$/g, (match, stem) => {
    // On ne touche pas aux noms qui se terminent normalement en s/x (bras, noix, etc.)
    const exceptions = new Set(["fois","temps","pois","bois","noix","voix","croix","riz","maïs","ananas","cous-cous","couscous","poix"]);
    if (exceptions.has(match)) return match;
    return stem;
  });

  return n;
}

// Parse une ligne d'ingrédient et retourne {name, qty, unit, cat}
function parseLine(line) {
  let s = line.trim().replace(/^[-–•*]\s*/, ""); // retirer les puces

  // Ignorer les lignes vides ou trop courtes
  if (!s || s.length < 2) return null;

  // Quantité
  const { qty, rest: afterQty } = parseQty(s);
  s = afterQty;

  // Unité
  const { unit, rest: afterUnit } = parseUnit(s);
  s = afterUnit;

  // Nettoyer le nom
  const name = cleanName(s);
  if (!name || name.length < 2) return null;

  // Chercher la catégorie dans le dictionnaire
  const found = findIngredient(name);
  const cat = found ? found.cat : "Autres";

  return { name, qty, unit: unit || "", cat };
}

// Parse un bloc de texte multi-lignes
function parseBlock(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const results = [];
  for (const line of lines) {
    // Séparer les lignes avec "et" quand elles ne contiennent pas de quantité
    const parts = line.includes(" et ") && !line.match(/^\d/)
      ? line.split(/\set\s/)
      : [line];
    for (const part of parts) {
      const parsed = parseLine(part.trim());
      if (parsed) results.push(parsed);
    }
  }
  // Dédupliquer les noms identiques
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });
}

module.exports = { parseLine, parseBlock };
