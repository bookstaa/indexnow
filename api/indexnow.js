export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS for POST
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method is allowed' });
  }

  const body = req.body;
  let path = '';

  // Detect resource type and construct URL path
  if (body.handle && body.title) {
    if (body.admin_graphql_api_id?.includes('Blog')) {
      path = `/blogs/${body.handle}`;
    } else if (body.admin_graphql_api_id?.includes('Page')) {
      path = `/pages/${body.handle}`;
    } else if (body.admin_graphql_api_id?.includes('Collection')) {
      path = `/collections/${body.handle}`;
    } else {
      // Fallback to product
      path = `/products/${body.handle}`;
    }
  }

  if (!path) {
    return res.status(400).json({ message: 'Could not construct path from webhook data' });
  }

  // Use Bookstaa domain instead of Vercel one
  const BASE_URL = 'https://indexnow-gilt.vercel.app';
const INDEXNOW_API_KEY = 'f957624a77ca4beea15944d6ee307b97';

const payload = {
  host: 'indexnow-gilt.vercel.app',
  key: INDEXNOW_API_KEY,
  keyLocation: `${BASE_URL}/${INDEXNOW_API_KEY}.txt`,
  urlList: [`https://bookstaa.com${path}`], // still notify your real site
};


  try {
    const indexnowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!indexnowResponse.ok) {
      console.error('❌ IndexNow error:', await indexnowResponse.text());
      return res.status(500).json({ error: 'IndexNow submission failed' });
    }

    console.log('✅ Submitted to IndexNow:', fullUrl);
    return res.status(200).json({ success: true, submitted: fullUrl });

  } catch (error) {
    console.error('❌ Error submitting to IndexNow:', error);
    return res.status(500).json({ error: 'IndexNow submission error', detail: error.message });
  }
}
