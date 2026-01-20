export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success:false, message:'Method not allowed' });
  }

  const { provider, value, code, serial, key } = req.body;

  // 🔐 KEY RIÊNG CHO ADMIN
  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success:false, message:'Unauthorized' });
  }

  if (!provider || !value || !code || !serial) {
    return res.json({ success:false, message:'Thiếu dữ liệu' });
  }

  try {
    const url =
      process.env.SHEET_ADD_URL +
      `?provider=${encodeURIComponent(provider)}` +
      `&value=${value}` +
      `&code=${encodeURIComponent(code)}` +
      `&serial=${encodeURIComponent(serial)}`;

    const r = await fetch(url);
    const data = await r.json();

    return res.json({
      success: true,
      message: 'Đã nạp thẻ vào kho',
      data
    });

  } catch (e) {
    return res.status(500).json({
      success:false,
      message:'Lỗi server',
      error: e.toString()
    });
  }
}
