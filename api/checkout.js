export default async function handler(req, res) {

  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success:false, message:"Method not allowed" });
  }

  const { orderId, provider, value, qty, amount } = req.body;

  if (!orderId || !provider || !value || !qty || !amount) {
    return res.json({ success:false, message:"Thiếu dữ liệu" });
  }

  try {
    /* ================== 1️⃣ CHECK ORDER ================== */
    const orderCheck = await fetch(
      `${process.env.SHEET_CHECK_ORDER}?orderId=${orderId}`
    ).then(r=>r.json());

    if (orderCheck.used) {
      return res.json({
        success:false,
        message:"Đơn hàng đã được sử dụng"
      });
    }

    /* ================== 2️⃣ CHECK THANH TOÁN ================== */
    const mb = await fetch(process.env.MB_API_URL).then(r=>r.json());

    const paid = mb.data.find(t =>
      Number(t.creditAmount) === Number(amount) &&
      t.description.includes(orderId)
    );

    if (!paid) {
      return res.json({
        success:false,
        message:"Chưa nhận được thanh toán"
      });
    }

    /* ================== 3️⃣ LẤY THẺ ================== */
    const cardRes = await fetch(
      `${process.env.SHEET_GET_CARD}?provider=${provider}&value=${value}&qty=${qty}`
    ).then(r=>r.json());

    if (!cardRes.success || cardRes.cards.length === 0) {
      return res.json({
        success:false,
        message:"Hết thẻ trong kho"
      });
    }

    /* ================== 4️⃣ LOG + KHÓA ORDER ================== */
    await fetch(process.env.SHEET_LOG_ORDER, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        orderId,
        provider,
        value,
        qty,
        amount,
        time: new Date().toISOString()
      })
    });

    /* ================== 5️⃣ TRẢ THẺ ================== */
    return res.json({
      success:true,
      orderId,
      cards: cardRes.cards
    });

  } catch (e) {
    return res.status(500).json({
      success:false,
      message:"Lỗi server",
      error:e.toString()
    });
  }
}
