const { withHandler, stripCredits, findFirstUrl, upstreamFetch, logUnexpected } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const user = (req.query.user || "").toString().trim();
  if (!user) return res.status(400).json({ ok: false, error: "Missing 'user' parameter" });

  const r = await upstreamFetch(`https://prexzyapis.com/stalk/ytstalk?user=${encodeURIComponent(user)}`);
  const data = await r.json();
  if (data && data.status === false) {
    return res.status(502).json({ ok: false, error: data.message || "Channel not found or upstream error" });
  }

  const result = stripCredits(data.result || data.data || data);
  const avatar = findFirstUrl(result, ["avatar", "thumbnail", "photo", "banner", "profile"]);
  res.status(200).json({ ok: true, result, avatar });
});
