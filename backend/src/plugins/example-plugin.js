// Example plugin showing the expected interface. This plugin targets a fictional site.
const axios = require('axios');
const cheerio = require('cheerio');

const id = 'example';
const name = 'ExampleSource';

async function search(query){
  // Example: site search page returns HTML
  const url = `https://fictional.example/search?q=${encodeURIComponent(query)}`;
  const { data } = await axios.get(url, { timeout: 10000 }).catch(e=>({data: ''}));
  const $ = cheerio.load(data || '');
  const out = [];
  $('.result').each((i, el) => {
    const el$ = $(el);
    out.push({
      id: el$.attr('data-id') || `${query}-${i}`,
      title: el$.find('.title').text().trim() || `Result ${i} for ${query}`,
      poster: el$.find('img').attr('src') || '',
      type: 'movie'
    });
  });
  // if none, return a simple mock result so demo works offline
  if(out.length === 0){
    out.push({ id: `${query}-demo`, title: `Demo: ${query}`, poster: '', type: 'movie' });
  }
  return out;
}

async function load(idVal){
  // Return a simple object with an example episode or url
  return { id: idVal, title: `Demo title ${idVal}`, url: `https://cdn.example.com/videos/${idVal}.m3u8`, episodes: [] };
}

async function* loadLinks(loadResp){
  // Yield the main url as an extracted link
  if(loadResp.url) yield { url: loadResp.url, quality: 'auto', host: 'fictional', title: loadResp.title || '' };
  return;
}

module.exports = { id, name, search, load, loadLinks };
