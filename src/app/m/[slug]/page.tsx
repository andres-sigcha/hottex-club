import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

export default async function MarketLanding({ params }: { params: { slug: string } }) {
  const market = await db.market.findUnique({ where: { slug: params.slug } });
  if (!market) return notFound();

  return (
    <main className="wrap">
      <h1>{market.cluster} Deals</h1>
      <p>Best local restaurant deals by SMS in {market.city}. No spam, easy STOP anytime.</p>
      <div className="card">
        <h3>Join this market</h3>
        <p className="muted">Double opt-in required. Msg frequency varies. Msg & data rates may apply.</p>
        <Link className="btn" href={`/signup?market=${market.slug}`}>Sign up</Link>
      </div>
    </main>
  );
}
