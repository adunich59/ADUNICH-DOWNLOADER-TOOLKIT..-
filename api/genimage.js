const { withHandler, fetchJsonOrBinary, findFirstUrl, sendBinary } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const prompt = (req.query.prompt || "").toString().trim();
  if (!prompt) return res.status(400).json({ ok: false, error: "Missing 'prompt' parameter" });

  const params = new URLSearchParams({ prompt });
  if (req.query.image) params.set("image", req.query.image);

  const result = await fetchJsonOrBinary(`https://prexzyapis.com/ai/genigpt?${params.toString()}`);

  if (result.kind === "binary") {
    return sendBinary(res, result);
  }
  if (result.data && result.data.status === false) {
    return res.status(502).json({ ok: false, error: result.data.message || "Upstream API error" });
  }
  const imageUrl = findFirstUrl(result.data, ["image", "url", "result", "output"]);
  if (!imageUrl) {
    return res.status(502).json({ ok: false, error: "No image found in the response" });
  }
  res.status(200).json({ ok: true, imageUrl });
});
