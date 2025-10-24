import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { base64Decode } from '../utils/base64';
import { LoadResponse, EpisodeLink } from '../types';

interface CinemetaMeta {
  name?: string;
  description?: string;
  poster?: string;
  background?: string;
  cast?: string[];
  genre?: string[];
  imdbRating?: string;
  year?: string;
  videos?: EpisodeDetails[];
}

interface EpisodeDetails {
  season?: number;
  episode?: number;
  title?: string;
  name?: string;
  overview?: string;
  thumbnail?: string;
}

interface CinemetaResponse {
  meta?: CinemetaMeta;
}

export const bollyflixPlugin = {
  id: 'bollyflix',
  name: 'BollyFlix',
  mainUrl: 'https://bollyflix.promo',
  lang: 'hi',

  search: async (query: string): Promise<any[]> => {
    const res = await fetch(`${bollyflixPlugin.mainUrl}/search/${encodeURIComponent(query)}/page/1/`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: any[] = [];
    $('div.post-cards > article').each((i: number, el: any) => {
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

    let title = $('title').text().replace('Download ', '');
    let posterUrl = $('meta[property="og:image"]').attr('content') || '';
    let plot = $('span#summary').text() || '';
    const imdbUrl = $('div.imdb_left > a').attr('href') || '';
    const isSeries = url.includes('web-series') || title.toLowerCase().includes('series');

    // Fetch Cinemeta metadata if IMDb available
    let metaData: CinemetaMeta = {};
    if (imdbUrl) {
      try {
        const imdbId = imdbUrl.split('/title/')[1]?.split('/')[0];
        const tvtype = isSeries ? 'series' : 'movie';
        const cinemetaRes = await fetch(`https://v3-cinemeta.strem.io/meta/${tvtype}/${imdbId}.json`);
        const cinemetaJson: CinemetaResponse = await cinemetaRes.json();
        if (cinemetaJson.meta) metaData = cinemetaJson.meta;
      } catch (e) { console.warn('Cinemeta fetch failed', e); }
    }

    title = metaData.name || title;
    plot = metaData.description || plot;
    posterUrl = metaData.poster || posterUrl;

    if (!isSeries) {
      // Movie: extract download links
      const sources: EpisodeLink[] = [];
      $('a.dl').each((i, el) => {
        const id = $(el).attr('href')?.split('id=')[1];
        if (id) sources.push({ source: base64Decode(id) });
      });
      const movieSources = sources.map(s => ({ url: s.source, quality: 'HD' }));
      return { title, posterUrl, plot, sources: movieSources };
    } else {
      // Series: extract seasons and episodes
      const episodes: { season: number; episode: number; title?: string; sources: { url: string }[] }[] = [];

      $('a.maxbutton-download-links, a.dl').each((i, el) => {
        const id = $(el).attr('href')?.split('id=')[1];
        if (!id) return;

        const seasonText = $(el).parent()?.prev()?.text() || '';
        const season = +(seasonText.match(/(?:Season |S)(\d+)/)?.[1] || 1);
        const episodeNum = i + 1; // fallback
        const urlDecoded = base64Decode(id);

        episodes.push({
          season,
          episode: episodeNum,
          sources: [{ url: urlDecoded }]
        });
      });

      return { title, posterUrl, plot, sources: [], episodes };
    }
  }
};
