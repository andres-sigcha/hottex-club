import Link from 'next/link';
import { db } from '@/lib/db';

export default async function Home() {
  const markets = await db.market.findMany({ where: { active: true }, orderBy: { city: 'asc' } });
  return (
    <main className="wrap">
      <h1>HotText Club</h1>
      <p className="muted">Hyperlocal, SMS-first daily restaurant deals for the Phoenix metro.</p>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {markets.map((m) => (
          <Link key={m.id} className="card" href={`/m/${m.slug}`}>
            <h3>{m.cluster}</h3>
            <p className="muted">{m.city}, {m.state}</p>
            <p>Get deals near you via text.</p>
          </Link>
        ))}
      </div>
      <p style={{ marginTop: 20 }}><Link className="btn alt" href="/login">Admin Login</Link></p>
    </main>
  );
}
