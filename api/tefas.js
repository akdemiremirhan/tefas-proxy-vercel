// api/tefas.js
export default async function handler(req, res) {
  const fonkod = req.query.fonkod;
  if (!fonkod) return res.status(400).json({ error: "missing_fonkod" });

  const target = `https://www.tefas.gov.tr/api/DB/BindComparisonFundReturns?fontip=1&fonkod=${encodeURIComponent(fonkod)}`;
  
  try {
    const fetchRes = await fetch(target, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.tefas.gov.tr/FonAnaliz.aspx"
      }
    });

    const text = await fetchRes.text();

    if (text.startsWith("<")) {
      return res.status(502).json({ error: "HTML_ERR" });
    }

    const json = JSON.parse(text);
    const data = json?.data?.[0];
    if (!data) return res.status(404).json({ error: "not_found" });

    return res.status(200).json({
      kod: data.FonKod,
      fiyat: data.BirimPayDegeri,
      tarih: data.Tarih
    });
  } catch (err) {
    return res.status(500).json({ error: "proxy_error", detail: err.message });
  }
}
