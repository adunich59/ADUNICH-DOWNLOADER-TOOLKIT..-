const { withHandler, fetchJsonOrBinary, sendBinary, findFirstUrl } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const result = await fetchJsonOrBinary("https://prexzyapis.com/random/car");
  if (result.kind === "binary") return sendBinary(res, result);
  const imageUrl = findFirstUrl(result.data, ["image", "url", "car"]);
  if (!imageUrl) return res.status(502).json({ ok: false, error: "No image found in the response" });
  res.status(200).json({ ok: true, imageUrl });
});
