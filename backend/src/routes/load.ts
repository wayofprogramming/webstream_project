import express from 'express';
import { plugins } from '../plugin-loader';
import { validatePlugin, callWithTimeout } from '../plugin-sandbox';

const router = express.Router();

router.get('/', async (req, res) => {
  const pluginId = String(req.query.plugin || '');
  const id = String(req.query.id || '');
  if(!pluginId || !id) return res.status(400).json({ error: 'plugin and id required' });
  const p = plugins[pluginId];
  if(!p) return res.status(404).json({ error: 'plugin not found' });
  try{
    validatePlugin(p);
    const data = await callWithTimeout(p.load.bind(p), [id], 15000);
    res.json(data);
  }catch(e){
    res.status(500).json({ error: String(e) });
  }
});

export default router;
