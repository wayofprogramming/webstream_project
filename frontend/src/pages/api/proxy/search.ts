import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  const q = req.query.q;
  const backend = process.env.BACKEND_URL || 'http://localhost:4000';
  const r = await fetch(`${backend}/api/search?q=${encodeURIComponent(String(q||''))}`);
  const data = await r.json();
  res.status(200).json(data);
}
