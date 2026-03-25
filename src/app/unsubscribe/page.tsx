import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

async function unsub(formData: FormData) {
  'use server';
  const phone = String(formData.get('phone') ?? '');
  const sub = await db.subscriber.findUnique({ where: { phone } });
  if (!sub) return;
  await db.subscriber.update({ where: { id: sub.id }, data: { status: 'UNSUBSCRIBED', consentStatus: 'REVOKED', unsubscribedAt: new Date() } });
  await db.consentLog.create({ data: { subscriberId: sub.id, eventType: 'UNSUBSCRIBE', message: 'Unsubscribed via web page.', source: 'unsubscribe-page' } });
  redirect('/');
}

export default function UnsubscribePage() {
  return (
    <main className="wrap">
      <h1>Unsubscribe</h1>
      <form action={unsub} className="card grid">
        <div><label>Phone number</label><input name="phone" placeholder="+14805551234" required /></div>
        <button className="btn" type="submit">Unsubscribe</button>
      </form>
    </main>
  );
}
