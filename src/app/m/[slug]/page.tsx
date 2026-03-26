import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

export default async function MarketLanding({ params }: { params: { slug: string } }) {
  const market = await db.market.findUnique({ where: { slug: params.slug } });
  if (!market) return notFound();

  return (
    <main className="wrap">
      <section className="hero stack">
        <span className="badge">{market.city} • {market.cluster}</span>
        <h1>{market.cluster} Deals</h1>
        <p>Local restaurant offers by SMS for {market.city}. Relevant deals, fast opt-out, no spam blasts.</p>
      </section>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
        <div className="card stack">
          <h3>What you get</h3>
          <p className="muted">• Hyperlocal offers near your zip code</p>
          <p className="muted">• Easy redemption links + in-store show-text deals</p>
          <p className="muted">• STOP and HELP support built in</p>
        </div>

        <div className="card stack">
          <h3>Join this market</h3>
          <p className="muted">Double opt-in required. Msg frequency varies. Msg & data rates may apply.</p>
          <Link className="btn" href={`/signup?market=${market.slug}`}>Sign up by SMS</Link>
        </div>
      </div>
    </main>
  );
}
