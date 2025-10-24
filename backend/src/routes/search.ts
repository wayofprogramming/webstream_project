import express from 'express';
import { plugins } from '../plugin-loader';

const router = express.Router();

router.get('/', async (req, res) => {
  const q = String(req.query.q || '');
  if (!q) return res.status(400).json({ error: 'q required' });

  const results: any[] = [];
  for (const id of Object.keys(plugins)) {
    try {
      const plugin = plugins[id];
      const r = await plugin.search(q);
      if (Array.isArray(r)) {
        r.forEach((it: any) => it._plugin = id);
        results.push(...r);
      }
    } catch (e: unknown) {
      console.error(e);
    }
  }

  res.json(results);
});

export default router;
