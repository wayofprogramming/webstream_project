import fs from 'fs';
import path from 'path';

// Exported registry
export const plugins: Record<string, any> = {};

export async function loadPlugins(){
  const dir = process.env.PLUGIN_DIR || path.join(__dirname, 'plugins');
  if(!fs.existsSync(dir)){
    console.warn('Plugin dir not found:', dir);
    return;
  }
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.js') || f.endsWith('.cjs'));
  for(const f of files){
    try{
      const p = path.join(dir,f);
      const mod = require(p);
      const id = mod.id || mod.default?.id || path.basename(f, path.extname(f));
      plugins[id] = mod.default || mod;
      console.log('Loaded plugin', id);
    }catch(e){
      console.error('Failed loading plugin', f, e);
    }
  }
}
