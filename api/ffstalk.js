const { withHandler, stripCredits, upstreamFetch, logUnexpected } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const id = (req.query.id || "").toString().trim();
  if (!id) return res.status(400).json({ ok: false, error: "Missing 'id' parameter" });

  const r = await upstreamFetch(`https://prexzyapis.com/stalk/ffstalk?id=${encodeURIComponent(id)}`);
  const data = await r.json();
  if (data && data.status === false) {
    return res.status(502).json({ ok: false, error: data.message || "Account not found or upstream error" });
  }

  const result = stripCredits(data.result || data.data || data);
  res.status(200).json({ ok: true, result });
});
