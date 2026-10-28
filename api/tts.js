const { withHandler, fetchJsonOrBinary, sendBinary, findFirstUrl } = require("../lib/helpers");

// Confirmed per-voice endpoints, each taking ?text=&pitch=&speed= (pitch/speed optional).
const TTS_VOICE_ENDPOINTS = {
  "Adult Female #1, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-female--1-american-english-truvoice",
  "Adult Female #2, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-female--2-american-english-truvoice",
  "Adult Male #1, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-male--1-american-english-truvoice",
  "Adult Male #2, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-male--2-american-english-truvoice",
  "Adult Male #3, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-male--3-american-english-truvoice",
  "Adult Male #4, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-male--4-american-english-truvoice",
  "Adult Male #5, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-male--5-american-english-truvoice",
  "Adult Male #6, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-male--6-american-english-truvoice",
  "Adult Male #7, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-male--7-american-english-truvoice",
  "Adult Male #8, American English (TruVoice)": "https://prexzyapis.com/tts/tts-adult-male--8-american-english-truvoice",
  "Female Whisper": "https://prexzyapis.com/tts/tts-female-whisper",
  "Male Whisper": "https://prexzyapis.com/tts/tts-male-whisper",
  "Mary": "https://prexzyapis.com/tts/tts-mary",
  "Mary (for Telephone)": "https://prexzyapis.com/tts/tts-mary-for-telephone",
  "Mary in Hall": "https://prexzyapis.com/tts/tts-mary-in-hall",
  "Mary in Space": "https://prexzyapis.com/tts/tts-mary-in-space",
  "Mary in Stadium": "https://prexzyapis.com/tts/tts-mary-in-stadium",
  "Mike": "https://prexzyapis.com/tts/tts-mike",
  "Mike (for Telephone)": "https://prexzyapis.com/tts/tts-mike-for-telephone",
  "Mike in Hall": "https://prexzyapis.com/tts/tts-mike-in-hall",
  "Mike in Space": "https://prexzyapis.com/tts/tts-mike-in-space",
  "Mike in Stadium": "https://prexzyapis.com/tts/tts-mike-in-stadium",
  "RoboSoft Five": "https://prexzyapis.com/tts/tts-robosoft-five",
  "RoboSoft Four": "https://prexzyapis.com/tts/tts-robosoft-four",
  "RoboSoft One": "https://prexzyapis.com/tts/tts-robosoft-one",
  "RoboSoft Six": "https://prexzyapis.com/tts/tts-robosoft-six",
  "RoboSoft Three": "https://prexzyapis.com/tts/tts-robosoft-three",
  "RoboSoft Two": "https://prexzyapis.com/tts/tts-robosoft-two",
  "Sam": "https://prexzyapis.com/tts/tts-sam",
};

function guessVoiceUrl(voiceName) {
  const slug = voiceName
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `https://prexzyapis.com/tts/tts-${slug}`;
}

module.exports = withHandler(async (req, res) => {
  const text = (req.query.text || "").toString().trim();
  const voice = (req.query.voice || "").toString();
  if (!text) return res.status(400).json({ ok: false, error: "Missing 'text' parameter" });
  if (!voice) return res.status(400).json({ ok: false, error: "Missing 'voice' parameter" });

  const baseUrl = TTS_VOICE_ENDPOINTS[voice] || guessVoiceUrl(voice);
  const params = new URLSearchParams({ text });
  if (req.query.pitch) params.set("pitch", req.query.pitch);
  if (req.query.speed) params.set("speed", req.query.speed);

  const result = await fetchJsonOrBinary(`${baseUrl}?${params.toString()}`);

  if (result.kind === "binary") return sendBinary(res, result);
  if (result.data && result.data.status === false) {
    return res.status(502).json({ ok: false, error: result.data.message || "Upstream API error" });
  }
  // Confirmed live shape includes "audio_url" directly.
  const audioUrl = (result.data && result.data.audio_url) || findFirstUrl(result.data, ["audio", "url", "voice", "sound"]);
  if (!audioUrl) return res.status(502).json({ ok: false, error: "No audio found in the response" });
  res.status(200).json({ ok: true, audioUrl });
});
