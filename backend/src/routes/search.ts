import express from 'express';
import { plugins } from '../plugin-loader';
import { validatePlugin, callWithTimeout } from '../plugin-sandbox';

const router = express.Router();

router.get('/', async (req, res) => {
  const q = String(req.query.q || '');
  if (!q) return res.status(400).json({ error: 'q required' });

  const results: any[] = [];
  const pluginIds = Object.keys(plugins);
  for (const id of pluginIds) {
    const p = plugins[id];
    try {
      validatePlugin(p);
      const r = await callWithTimeout(p.search.bind(p), [q], 10000);
      if (Array.isArray(r)) {
        r.forEach((it: any) => it._plugin = id);
        results.push(...r);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }

  }
  res.json(results);
});

export default router;
