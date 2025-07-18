export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY || 'f957624a77ca4beea15944d6ee307b97';

  // If coming from Shopify Webhook
  if (req.headers['user-agent'] && req.headers['user-agent'].includes('Shopify')) {
    const product = req.body;

    // Get product handle (e.g., "/products/book-title")
    const productUrl = `https://bookstaa.com/products/${product.handle}`;

    const body = {
      host: 'bookstaa.com',
      key: INDEXNOW_API_KEY,
      keyLocation: `https://bookstaa.com/${INDEXNOW_API_KEY}.txt`,
      urlList: [productUrl]
    };

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const text = await response.text();
      return res.status(200).json({ message: 'Product URL submitted to IndexNow', response: text });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to notify IndexNow', error: err.message });
    }
  }

  // Manual URL submission fallback
  const urls = req.body.urls || [];
  if (!urls.length) return res.status(400).json({ message: 'No URLs provided' });

  const body = {
    host: 'bookstaa.com',
    key: INDEXNOW_API_KEY,
    keyLocation: `https://bookstaa.com/${INDEXNOW_API_KEY}.txt`,
    urlList: urls
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ message: 'IndexNow request failed', error: err.message });
  }
}
