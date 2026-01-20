export default async function handler(req, res) {
  try {
    const { provider, value } = req.query;

    if (!provider || !value) {
      return res.status(400).json({
        success: false,
        message: "Thiếu provider hoặc value"
      });
    }

    // URL Google Apps Script (lấy từ ENV)
    const SHEET_API = process.env.SHEET_API_URL;

    if (!SHEET_API) {
      return res.status(500).json({
        success: false,
        message: "Chưa cấu hình SHEET_API_URL"
      });
    }

    const url =
      SHEET_API +
      "?provider=" + encodeURIComponent(provider) +
      "&value=" + encodeURIComponent(value);

    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.toString()
    });
  }
}
