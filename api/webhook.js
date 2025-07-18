export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  try {
    const body = req.body;

    const handle =
      body.handle ||
      body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    if (!handle) {
      return res.status(400).json({ message: 'No handle or title found' });
    }

    const url = `https://bookstaa.com/products/${handle}`;

    const response = await fetch('https://indexnow-gilt.vercel.app/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle,
        title: body.title,
        admin_graphql_api_id: body.admin_graphql_api_id || 'Product',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('IndexNow webhook submission failed:', text);
      return res.status(502).json({ error: 'IndexNow submission failed', detail: text });
    }

    console.log('✅ Webhook: Submitted to IndexNow:', url);
    return res.status(200).json({ success: true, submitted: url });
  } catch (err) {
    console.error('❌ Webhook error:', err);
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
