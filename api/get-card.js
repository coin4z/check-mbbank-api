export default async function handler(req, res) {

  /* ========== CORS ========== */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ success:false, message:"Method not allowed" });

  /* ========== INPUT ========== */
  const { orderId, provider, value, qty, email } = req.body;

  if (!orderId || !provider || !value || !qty || !email) {
    return res.json({ success:false, message:"Thiếu tham số" });
  }

  try {
    /* ========== 1. CHECK ORDER ĐÃ DÙNG ========== */
    const checkOrderUrl =
      process.env.SHEET_CHECK_ORDER +
      `?orderId=${encodeURIComponent(orderId)}`;

    const checkRes = await fetch(checkOrderUrl);
    const checkData = await checkRes.json();

    if (checkData.used) {
      return res.json({
        success:false,
        message:"Đơn hàng đã được xử lý"
      });
    }

    /* ========== 2. LẤY N THẺ ========== */
    const getCardUrl =
      process.env.SHEET_GET_CARD +
      `?provider=${encodeURIComponent(provider)}` +
      `&value=${value}` +
      `&qty=${qty}`;

    const cardRes = await fetch(getCardUrl);
    const cardData = await cardRes.json();

    if (!cardData.success || cardData.cards.length < qty) {
      return res.json({
        success:false,
        message:"Kho không đủ thẻ"
      });
    }

    /* ========== 3. GHI LOG + KHÓA ĐƠN ========== */
    const logUrl =
      process.env.SHEET_LOG_ORDER +
      `?orderId=${encodeURIComponent(orderId)}` +
      `&email=${encodeURIComponent(email)}` +
      `&provider=${provider}` +
      `&value=${value}` +
      `&qty=${qty}`;

    await fetch(logUrl);

    /* ========== 4. TRẢ KẾT QUẢ ========== */
    return res.json({
      success:true,
      orderId,
      provider,
      value,
      qty,
      cards: cardData.cards   // [{code,serial},...]
    });

  } catch (e) {
    return res.status(500).json({
      success:false,
      message:"Lỗi server",
      error: e.toString()
    });
  }
}
