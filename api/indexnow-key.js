export default async function handler(req, res) {
  const INDEXNOW_KEY = 'f957624a77ca4beea15944d6ee307b97';

  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(INDEXNOW_KEY);
}

