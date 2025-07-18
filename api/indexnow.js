export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method is allowed' });
  }

  const body = req.body;
  let url = '';

  // Detect resource type and construct URL
  if (body.handle && body.title) {
    if (body.admin_graphql_api_id.includes('Blog')) {
      url = `https://bookstaa.com/blogs/${body.handle}`;
    } else if (body.admin_graphql_api_id.includes('Page')) {
      url = `https://bookstaa.com/pages/${body.handle}`;
    } else if (body.admin_graphql_api_id.includes('Collection')) {
      url = `https://bookstaa.com/collections/${body.handle}`;
    }
  }

  // Fallback: product URL (already working)
  if (!url && body.handle && body.title) {
    url = `https://bookstaa.com/products/${body.handle}`;
  }

  if (!url) {
    return res.status(400).json({ message: 'Could not construct URL from webhook data' });
  }

  const INDEXNOW_API_KEY = 'f957624a77ca4beea15944d6ee307b97';
  const payload = {
    host: 'bookstaa.com',
    key: INDEXNOW_API_KEY,
    keyLocation: `https://bookstaa.com/${INDEXNOW_API_KEY}.txt`,
    urlList: [url]
  };

  const indexnowResponse = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('✅ Submitted to IndexNow:', url);
  res.status(200).json({ success: true, submitted: url });
}
