export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*'); // ✅ Allow browser access

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method is allowed' });
  }

  const body = req.body;
  let url = '';

  // Detect resource type and construct proper URL
  if (body.handle && body.title) {
    if (body.admin_graphql_api_id?.includes('Blog')) {
      url = `https://bookstaa.com/blogs/${body.handle}`;
    } else if (body.admin_graphql_api_id?.includes('Page')) {
      url = `https://bookstaa.com/pages/${body.handle}`;
    } else if (body.admin_graphql_api_id?.includes('Collection')) {
      url = `https://bookstaa.com/collections/${body.handle}`;
    }
  }

  // Fallback for product URL or browser-side request
  if (!url && body.handle && body.title) {
    url = `https://bookstaa.com/products/${body.handle}`;
  }

  // Direct URL passed (for user visit tracking)
  if (!url && body.url) {
    url = body.url;
  }

  if (!url) {
    return res.status(400).json({ message: 'Could not determine URL to submit' });
  }

  const INDEXNOW_API_KEY = 'f957624a77ca4beea15944d6ee307b97';
  const payload = {
    host: 'bookstaa.com',
    key: INDEXNOW_API_KEY,
    keyLocation: `https://bookstaa.com/${INDEXNOW_API_KEY}.txt`,
    urlList: [url]
  };

  try {
    const indexnowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!indexnowResponse.ok) {
      const text = await indexnowResponse.text();
      console.error('❌ IndexNow error:', text);
      return res.status(502).json({ error: 'Failed to submit to IndexNow', detail: text });
    }

    console.log('✅ Submitted to IndexNow:', url);
    return res.status(200).json({ success: true, submitted: url });
  } catch (error) {
    console.error('🔥 Error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error occurred' });
  }
}
