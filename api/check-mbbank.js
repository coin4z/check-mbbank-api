export default async function handler(req, res) {
  try {
    const token = process.env.THUEAPI_TOKEN;

    const response = await fetch(
      `https://thueapi.pro/historyapimbbank/${token}`
    );

    const data = await response.json();

    res.status(200).json({
      success: true,
      data: data.TranList || []
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
}
