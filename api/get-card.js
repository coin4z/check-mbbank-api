export default async function handler(req, res) {
  try {
    const { provider, value, key } = req.query;

    // 🔐 API KEY bảo vệ
    if (key !== process.env.API_KEY) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!provider || !value) {
      return res.json({
        success: false,
        message: "Thiếu tham số"
      });
    }

    const sheetApi =
      process.env.SHEET_API_URL +
      `?provider=${encodeURIComponent(provider)}` +
      `&value=${encodeURIComponent(value)}`;

    const response = await fetch(sheetApi, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    return res.json(data);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.toString()
    });
  }
}
