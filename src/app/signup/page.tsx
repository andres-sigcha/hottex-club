import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

async function submit(formData: FormData) {
  'use server';
  const phone = String(formData.get('phone') ?? '').trim();
  const zipCode = String(formData.get('zipCode') ?? '').trim();
  const marketId = String(formData.get('marketId') ?? '');
  const source = String(formData.get('source') ?? 'landing-page');
  const cuisine = String(formData.get('cuisine') ?? '');
  const dietary = String(formData.get('dietary') ?? '');

  if (!phone || !zipCode || !marketId) return;

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const sub = await db.subscriber.upsert({
    where: { phone },
    update: { zipCode, source, confirmationCode: code, consentStatus: 'PENDING', status: 'ACTIVE', marketId },
    create: { phone, zipCode, source, confirmationCode: code, consentStatus: 'PENDING', marketId },
  });

  await db.subscriberPreference.upsert({
    where: { id: `pref-${sub.id}` },
    update: { cuisine, dietary },
    create: { id: `pref-${sub.id}`, subscriberId: sub.id, cuisine, dietary },
  });

  await db.consentLog.create({
    data: {
      subscriberId: sub.id,
      eventType: 'DOUBLE_OPT_IN_INITIATED',
      message: `Confirmation code generated: ${code}`,
      source,
    },
  });

  // MVP: confirmation code shown on screen for local demo when SMS provider not configured.
  redirect(`/confirm?phone=${encodeURIComponent(phone)}`);
}

export default async function SignupPage({ searchParams }: { searchParams: { market?: string } }) {
  const markets = await db.market.findMany({ where: { active: true }, orderBy: [{ city: 'asc' }, { cluster: 'asc' }] });
  const selected = markets.find((m) => m.slug === searchParams.market)?.id ?? markets[0]?.id;

  return (
    <main className="wrap">
      <h1>Sign up for local deals</h1>
      <p className="muted">Consent required. Reply STOP anytime. Reply HELP for support.</p>
      <form action={submit} className="card grid">
        <div><label>Phone</label><input name="phone" placeholder="+14805551234" required /></div>
        <div><label>Zip code</label><input name="zipCode" required /></div>
        <div>
          <label>Market</label>
          <select name="marketId" defaultValue={selected}>{markets.map((m) => <option key={m.id} value={m.id}>{m.cluster}</option>)}</select>
        </div>
        <div><label>Cuisine preference (optional)</label><input name="cuisine" /></div>
        <div><label>Dietary preference (optional)</label><input name="dietary" /></div>
        <input type="hidden" name="source" value="market-landing" />
        <label><input type="checkbox" required /> I agree to receive recurring automated marketing text messages from HotText Club. Consent is not a condition of purchase. Msg & data rates may apply.</label>
        <button className="btn" type="submit">Start double opt-in</button>
      </form>
    </main>
  );
}
