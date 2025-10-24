import Link from 'next/link';
export default function Home(){
  return (
    <main style={{padding:20}}>
      <h1>WebStream</h1>
      <p>Start searching for movies/shows</p>
      <Link href="/search">Go to search</Link>
    </main>
  );
}
