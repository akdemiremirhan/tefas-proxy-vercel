// api/tefas.js - Vercel Serverless function
export default async function handler(req, res) {
  const SECRET = process.env.SECRET_KEY || "";
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];

  if (!apiKey || apiKey !== SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const fonkod = req.query.fonkod;
  if (!fonkod) return res.status(400).json({ error: "missing_fonkod" });

  const target = `https://www.tefas.gov.tr/api/DB/BindComparisonFundReturns?fontip=1&fonkod=${encodeURIComponent(fonkod)}`;

  try {
    const fetchRes = await fetch(target, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.tefas.gov.tr/FonAnaliz.aspx",
      }
    });

    const contentType = fetchRes.headers.get("content-type") || "";
    const text = await fetchRes.text();

    if (contentType.includes("application/json")) {
      // TEFAS JSON döndürdü -> aynen geçir
      res.setHeader("Content-Type", "application/json");
      return res.status(fetchRes.status).send(text);
    } else {
      // HTML veya engelleme gelmiş
      return res.status(502).json({
        error: "blocked_or_html",
        preview: text.substring(0, 1000),
        statusFromTarget: fetchRes.status
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "fetch_exception", message: String(err) });
  }
}
