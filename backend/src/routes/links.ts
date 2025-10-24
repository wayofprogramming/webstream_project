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
    const loadResp = await callWithTimeout(p.load.bind(p), [id], 15000);
    const links: any[] = [];
    const gen = p.loadLinks.bind(p);
    const out = gen(loadResp);
    if(typeof out[Symbol.asyncIterator] === 'function'){
      for await (const link of out){
        links.push(link);
      }
    } else if(Array.isArray(out)){
      links.push(...out);
    }
    res.json(links);
  }catch(e){
    res.status(500).json({ error: String(e) });
  }
});

export default router;
