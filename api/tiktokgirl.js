const { withHandler, fetchJsonOrBinary, sendBinary, findFirstUrl } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const result = await fetchJsonOrBinary("https://prexzyapis.com/random/tiktokgirl");
  if (result.kind === "binary") return sendBinary(res, result);
  const videoUrl = findFirstUrl(result.data, ["video", "url"]);
  if (!videoUrl) return res.status(502).json({ ok: false, error: "No video found in the response" });
  res.status(200).json({ ok: true, videoUrl });
});
