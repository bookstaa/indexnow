export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send("IndexNow endpoint is alive ✅");
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method is allowed' });
  }

  const INDEXNOW_API_KEY = 'f957624a77ca4beea15944d6ee307b97';

  try {
    const shopifyData = req.body;

    // 🔍 Extract product handle to build URL
    const handle = shopifyData.handle;
    if (!handle) {
      return res.status(400).json({ message: 'Product handle not found in payload' });
    }

    const productUrl = `https://bookstaa.com/products/${handle}`;

    const indexnowPayload = {
      host: 'bookstaa.com',
      key: INDEXNOW_API_KEY,
      keyLocation: `https://bookstaa.com/${INDEXNOW_API_KEY}.txt`,
      urlList: [productUrl],
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(indexnowPayload),
    });

    const text = await response.text();

    console.log("✅ Submitted to IndexNow:", productUrl);
    res.status(200).send(text);
  } catch (err) {
    console.error("❌ Error submitting to IndexNow:", err);
    res.status(500).json({ message: 'IndexNow request failed', error: err.message });
  }
}
