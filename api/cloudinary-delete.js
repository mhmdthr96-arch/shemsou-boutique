/**
 * ⚜️ SHEMSOU BOUTIQUE - Cloudinary Asset Deletion (Serverless)
 * Deletes an asset from Cloudinary using the Admin API with server-only
 * credentials, so removing a product/slide actually frees the free-tier quota.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { public_id, resource_type = 'image' } = req.body || {};
  if (!public_id) {
    return res.status(400).json({ error: 'public_id required' });
  }

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud || !key || !secret) {
    return res.status(500).json({ error: 'Cloudinary server config missing' });
  }

  const url = `https://api.cloudinary.com/v1_1/${cloud}/resources/${resource_type}/upload/${encodeURIComponent(public_id)}`;
  const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');

  try {
    const r = await fetch(url, { method: 'DELETE', headers: { Authorization: auth } });
    const ct = r.headers.get('content-type') || '';
    let data;
    if (ct.includes('application/json')) {
      data = await r.json();
    } else {
      const text = await r.text();
      data = {
        ok: false,
        error: r.status === 404 ? 'Asset not found' : 'Unexpected Cloudinary response',
        status: r.status
      };
    }
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
