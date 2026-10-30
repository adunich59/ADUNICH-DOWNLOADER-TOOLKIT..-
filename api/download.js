const { withHandler, stripCredits, upstreamFetch, logUnexpected } = require("../lib/helpers");

// Confirmed live shape:
// { status, data: { title, author, duration, thumbnail,
//   medias: [{ url, quality, extension, type, data_size, width, height }],
//   best: {...} } }
const QUALITY_LABELS = {
  hd_no_watermark: "Video (HD, No Watermark)",
  no_watermark: "Video (No Watermark)",
  watermark: "Video (Watermark)",
  audio: "Audio (MP3)",
};

module.exports = withHandler(async (req, res) => {
  const link = (req.query.url || "").toString().trim();
  if (!link) return res.status(400).json({ ok: false, error: "Missing 'url' parameter" });

  const r = await upstreamFetch(`https://prexzyapis.com/download/aio?url=${encodeURIComponent(link)}`);
  const data = await r.json();
  if (data && data.status === false) {
    return res.status(502).json({ ok: false, error: data.message || "Upstream API error" });
  }

  const d = stripCredits(data.data || data.result || data);
  const seen = new Set();
  const items = [];
  for (const entry of d.medias || []) {
    if (!entry || !entry.url || seen.has(entry.url)) continue;
    seen.add(entry.url);
    const label = QUALITY_LABELS[entry.quality] || entry.quality || entry.type || "Media";
    items.push({ url: entry.url, label, type: entry.type, size: entry.data_size });
  }

  res.status(200).json({
    ok: true,
    title: d.title || "",
    author: d.author || "",
    thumbnail: d.thumbnail || null,
    duration: d.duration || null,
    items,
  });
});
