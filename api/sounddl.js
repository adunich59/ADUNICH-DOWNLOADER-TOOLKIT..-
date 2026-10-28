const { withHandler, findFirstUrl, stripCredits } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const link = (req.query.url || "").toString().trim();
  if (!link) return res.status(400).json({ ok: false, error: "Missing 'url' parameter" });

  const r = await fetch(`https://prexzyapis.com/sound/download?url=${encodeURIComponent(link)}`);
  const data = await r.json();
  if (data && data.status === false) {
    return res.status(502).json({ ok: false, error: data.message || "Upstream API error" });
  }

  const cleaned = stripCredits(data);
  const audioUrl = findFirstUrl(cleaned, ["audio", "mp3", "sound", "download", "url"]);
  if (!audioUrl) {
    return res.status(502).json({ ok: false, error: "No downloadable sound found in the response" });
  }

  const title =
    (cleaned.result && (cleaned.result.title || cleaned.result.name)) ||
    (cleaned.data && (cleaned.data.title || cleaned.data.name)) ||
    null;

  res.status(200).json({ ok: true, audioUrl, title });
});
