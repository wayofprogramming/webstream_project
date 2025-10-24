import { useRouter } from 'next/router';
import useSWR from 'swr';
import Player from '../../components/Player';

const fetcher = (url:string) => fetch(url).then(r=>r.json());

export default function Watch(){
  const r = useRouter();
  const id = typeof r.query.id === 'string' ? r.query.id : '';
  const [plugin, itemId] = (id || '').split('::');
  const { data:links } = useSWR(itemId ? `/api/proxy/links?plugin=${encodeURIComponent(plugin)}&id=${encodeURIComponent(itemId)}` : null, fetcher);

  return (
    <main style={{padding:20}}>
      <h1>Watch</h1>
      {links && links.length>0 ? (
        <div>
          <h2>{links[0].title || 'Stream'}</h2>
          <Player src={links[0].url} />
          <ul>
            {links.map((l:any,i:number)=> <li key={i}>{l.quality} - <a href={l.url} target="_blank">open</a></li>)}
          </ul>
        </div>
      ) : <div>Loading links...</div>}
    </main>
  );
}
