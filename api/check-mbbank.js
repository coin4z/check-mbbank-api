export default async function handler(req, res) {
  try {
    const token = process.env.THUEAPI_TOKEN;

    // Lấy param từ Blogger
    const { code, amount } = req.query;

    const response = await fetch(
      `https://thueapi.pro/historyapimbbank/${token}`
    );
    const json = await response.json();
    const list = json.TranList || [];

    // Lọc giao dịch hợp lệ
    const found = list.find(item => {
      const matchAmount = amount
        ? item.creditAmount === amount
        : true;

      const matchCode = code
        ? item.description.toLowerCase().includes(code.toLowerCase())
        : true;

      return matchAmount && matchCode;
    });

    if (found) {
      res.json({
        success: true,
        matched: true,
        transaction: found
      });
    } else {
      res.json({
        success: true,
        matched: false
      });
    }

  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
}
