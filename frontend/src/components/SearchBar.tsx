import { useState } from 'react';
export default function SearchBar({ onSearch }:{onSearch:(q:string)=>void}){
  const [q, setQ] = useState('');
  return (
    <form onSubmit={e=>{e.preventDefault(); onSearch(q);}} style={{display:'flex', gap:8}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." />
      <button type="submit">Search</button>
    </form>
  );
}
