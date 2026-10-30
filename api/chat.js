const { withHandler, upstreamFetch, logUnexpected } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const text = (req.query.text || "").toString().trim();
  if (!text) return res.status(400).json({ ok: false, error: "Missing 'text' parameter" });

  const r = await upstreamFetch(`https://prexzyapis.com/ai/ornith-1-5-122b?text=${encodeURIComponent(text)}`);
  const data = await r.json();
  if (data && data.status === false) {
    logUnexpected("chat", data);
    return res.status(502).json({ ok: false, error: data.message || "Upstream API error" });
  }
  const reply = data.response || data.result || data.message;
  if (!reply) logUnexpected("chat", data);
  if (!reply) return res.status(502).json({ ok: false, error: "No reply text found in the response" });
  res.status(200).json({ ok: true, reply });
});
                
