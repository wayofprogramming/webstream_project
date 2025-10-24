import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { base64Decode } from '../utils/base64';

interface EpisodeLink {
  source: string;
}

interface LoadResponse {
  title: string;
  posterUrl: string;
  plot: string;
  year?: string;
  tags?: string[];
  sources: { url: string; quality?: string }[];
  episodes?: { season: number; episode: number; title?: string; sources: EpisodeLink[] }[];
}

export const bollyflixPlugin = {
  id: 'bollyflix',
  name: 'BollyFlix',
  mainUrl: 'https://bollyflix.promo',

  search: async (query: string) => {
    const res = await fetch(`${bollyflixPlugin.mainUrl}/search/${encodeURIComponent(query)}/page/1/`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const results = [];
    $('div.post-cards > article').each((i, el) => {
      const title = $(el).find('a').attr('title')?.replace('Download ', '') || '';
      const url = $(el).find('a').attr('href') || '';
      const poster = $(el).find('img').attr('src') || '';
      results.push({ id: url, title, url, poster });
    });

    return results;
  },

  load: async (url: string): Promise<LoadResponse> => {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('title').text().replace('Download ', '');
    const posterUrl = $('meta[property="og:image"]').attr('content') || '';
    const plot = $('span#summary').text() || '';

    // Determine type: movie or series
    const isSeries = url.includes('web-series') || title.toLowerCase().includes('series');

    if (!isSeries) {
      // Movie: extract download links
      const sources: EpisodeLink[] = [];
      $('a.dl').each((i, el) => {
        const id = $(el).attr('href')?.split('id=')[1];
        if (id) sources.push({ source: base64Decode(id) });
      });

      return { title, posterUrl, plot, sources };
    } else {
      // Series: extract episodes by season
      const episodes: { season: number; episode: number; title?: string; sources: EpisodeLink[] }[] = [];
      const seasonElements = $('a.maxbutton-download-links, a.dl');

      for (let i = 0; i < seasonElements.length; i++) {
        const el = seasonElements[i];
        const id = $(el).attr('href')?.split('id=')[1];
        if (!id) continue;

        // Extract season number from previous sibling
        const seasonText = $(el).parent().prev().text() || '';
        const season = parseInt((seasonText.match(/(?:Season |S)(\d+)/) || ['0', '0'])[1]);

        const decodedUrl = base64Decode(id);
        const seasonHtml = await fetch(decodedUrl).then(r => r.text());
        const $$ = cheerio.load(seasonHtml);
        const epLinks: EpisodeLink[] = [];

        $$('h3 > a').each((j, link) => {
          if (!$(link).text().toLowerCase().includes('zip')) {
            epLinks.push({ source: $(link).attr('href') || '' });
          }
        });

        epLinks.forEach((source, epIdx) => {
          episodes.push({ season, episode: epIdx + 1, sources: [source] });
        });
      }

      return { title, posterUrl, plot, episodes };
    }
  }
};
