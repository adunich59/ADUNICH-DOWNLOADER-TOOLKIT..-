const CREDIT_NAME = "𝔸𝔻𝕌ℕ𝕀ℂℍʳᵉᵗⁱʳᵉᵈ༒";

const CREDIT_KEYS = new Set(["creator", "service", "poweredby", "powered_by", "apiby"]);

function stripCredits(data) {
  if (Array.isArray(data)) return data.map(stripCredits);
  if (data && typeof data === "object") {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      if (CREDIT_KEYS.has(String(k).toLowerCase())) continue;
      out[k] = stripCredits(v);
    }
    return out;
  }
  return data;
}

function findFirstUrl(data, hints = []) {
  let hinted = null;
  let generic = null;
  function walk(obj) {
    if (hinted) return;
    if (Array.isArray(obj)) {
      for (const item of obj) walk(item);
      return;
    }
    if (obj && typeof obj === "object") {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" && v.startsWith("http")) {
          if (hints.some((h) => String(k).toLowerCase().includes(h))) {
            hinted = v;
            return;
          }
          if (!generic) generic = v;
        } else {
          walk(v);
        }
      }
    }
  }
  walk(data);
  return hinted || generic || null;
}

// Fetches a URL and returns either a parsed JSON body or raw binary bytes,
// depending on the upstream content-type. Mirrors the dual-branch pattern
// used throughout the Telegram bot (mkimage, genigpt, random/car, etc).
async function fetchJsonOrBinary(url, binaryPrefixes = ["image/", "video/", "audio/"]) {
  const r = await fetch(url);
  const contentType = r.headers.get("content-type") || "";
  if (binaryPrefixes.some((p) => contentType.startsWith(p))) {
    const buf = Buffer.from(await r.arrayBuffer());
    return { kind: "binary", contentType, data: buf, status: r.status, ok: r.ok };
  }
  let json = null;
  try {
    json = await r.json();
  } catch (e) {
    json = null;
  }
  return { kind: "json", data: json, status: r.status, ok: r.ok };
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Standard wrapper for every /api handler: sets CORS, handles preflight,
// and converts thrown errors into a clean JSON error response instead of
// a raw 500 with a stack trace.
function withHandler(fn) {
  return async (req, res) => {
    setCors(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    try {
      await fn(req, res);
    } catch (e) {
      console.error(e);
      res.status(502).json({ ok: false, error: "Upstream request failed", detail: String(e) });
    }
  };
}

function sendBinary(res, bin) {
  res.setHeader("Content-Type", bin.contentType);
  res.status(200).send(bin.data);
}

module.exports = {
  CREDIT_NAME,
  stripCredits,
  findFirstUrl,
  fetchJsonOrBinary,
  withHandler,
  sendBinary,
};
