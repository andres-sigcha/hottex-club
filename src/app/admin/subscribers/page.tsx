import { db } from '@/lib/db';

export default async function SubscribersPage() {
  const subs = await db.subscriber.findMany({ include: { market: true, preferences: true }, orderBy: { createdAt: 'desc' } });
  return (
    <div className="card">
      <h3>Subscribers</h3>
      <table>
        <thead><tr><th>Phone</th><th>Market</th><th>Zip</th><th>Consent</th><th>Status</th><th>Prefs</th><th>Last message</th></tr></thead>
        <tbody>
          {subs.map(s => <tr key={s.id}><td>{s.phone}</td><td>{s.market.cluster}</td><td>{s.zipCode}</td><td>{s.consentStatus}</td><td>{s.status}</td><td>{s.preferences[0]?.cuisine || '-'} / {s.preferences[0]?.dietary || '-'}</td><td>{s.lastMessageSentAt ? new Date(s.lastMessageSentAt).toLocaleString() : '-'}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
