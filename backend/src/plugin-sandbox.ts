export function validatePlugin(plugin: any){
  if(!plugin) throw new Error('plugin empty');
  if(typeof plugin.search !== 'function') throw new Error('plugin.search required');
  if(typeof plugin.load !== 'function') throw new Error('plugin.load required');
  if(typeof plugin.loadLinks !== 'function' && typeof plugin.loadLinks !== 'object') {
    throw new Error('plugin.loadLinks required');
  }
}

export async function callWithTimeout(fn: Function, args: any[], ms = 15000){
  return Promise.race([
    Promise.resolve().then(()=>fn(...args)),
    new Promise((_, rej)=> setTimeout(()=> rej(new Error('plugin timeout')), ms))
  ]);
}
