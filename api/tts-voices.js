const { withHandler } = require("../lib/helpers");

module.exports = withHandler(async (req, res) => {
  const r = await fetch("https://prexzyapis.com/tts/tts-voices");
  const data = await r.json();
  res.status(200).json({ ok: true, voices: data.voices || [] });
});
