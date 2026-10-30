const { withHandler, stripCredits, upstreamFetch, logUnexpected } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const text = (req.query.text || "").toString().trim();
  if (!text) return res.status(400).json({ ok: false, error: "Missing 'text' parameter" });

  const r = await upstreamFetch(`https://prexzyapis.com/tools/detectlanguage?text=${encodeURIComponent(text)}`);
  const data = await r.json();
  if (data && data.status === false) {
    return res.status(502).json({ ok: false, error: data.message || "Upstream API error" });
  }
  const result = stripCredits(data.result || data.data || data);
  res.status(200).json({ ok: true, result });
});
