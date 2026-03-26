import Link from 'next/link';
import { db } from '@/lib/db';

export default async function Home() {
  const markets = await db.market.findMany({ where: { active: true }, orderBy: [{ city: 'asc' }, { cluster: 'asc' }] });

  return (
    <main className="wrap">
      <section className="hero stack">
        <span className="badge">Phoenix Hyperlocal MVP</span>
        <h1>HotText Club</h1>
        <p style={{ maxWidth: 760 }}>
          SMS-first local restaurant deals, segmented by city/cluster and zip code so every message stays relevant.
        </p>
        <p className="muted">Reply STOP anytime. Reply HELP for support. Double opt-in required.</p>
      </section>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        {markets.map((m) => (
          <Link key={m.id} className="card market-card" href={`/m/${m.slug}`}>
            <p className="market-city">{m.city}, {m.state}</p>
            <h3>{m.cluster}</h3>
            <p className="muted">Get daily local offers near you by text.</p>
            <span className="btn" style={{ marginTop: 8 }}>Join this market</span>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: 20 }}>
        <Link className="btn alt" href="/login">Admin Login</Link>
      </p>
    </main>
  );
}
