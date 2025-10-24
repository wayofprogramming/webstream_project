import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url:string) => fetch(url).then(r=>r.json());

export default function Search(){
  const [q, setQ] = useState('');
  const { data, error } = useSWR(q? `/api/proxy/search?q=${encodeURIComponent(q)}` : null, fetcher);

  return (
    <main style={{padding:20}}>
      <h1>Search</h1>
      <SearchBar onSearch={setQ} />
      {error && <div>Error loading</div>}
      <ul>
        {data && data.map((it:any)=> (
          <li key={it.id} style={{margin:10}}>
            <img src={it.poster} width={80} alt="" />
            <div>{it.title} <small>({it._plugin})</small></div>
            <Link href={`/watch/${encodeURIComponent(it._plugin + '::' + it.id)}`}>Watch</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
