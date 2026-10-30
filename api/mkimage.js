const { withHandler, fetchJsonOrBinary, findFirstUrl, sendBinary } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const text = (req.query.text || "").toString().trim();
  if (!text) return res.status(400).json({ ok: false, error: "Missing 'text' parameter" });

  const params = new URLSearchParams({ text });
  if (req.query.background) params.set("background", req.query.background);
  if (req.query.color) params.set("color", req.query.color);
  if (req.query.emojiStyle) params.set("emojiStyle", req.query.emojiStyle);

  const result = await fetchJsonOrBinary(`https://prexzyapis.com/imagecreator/image?${params.toString()}`);

  if (result.kind === "binary") {
    return sendBinary(res, result);
  }
  if (result.data && result.data.status === false) {
    return res.status(502).json({ ok: false, error: result.data.message || "Upstream API error" });
  }
  const imageUrl = findFirstUrl(result.data, ["image", "url", "result"]);
  if (!imageUrl) {
    return res.status(502).json({ ok: false, error: "No image found in the response" });
  }
  res.status(200).json({ ok: true, imageUrl });
});
