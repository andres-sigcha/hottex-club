import { db } from '@/lib/db';

async function addManual(formData: FormData) {
  'use server';
  await db.redemptionEvent.create({
    data: {
      dealId: String(formData.get('dealId') ?? ''),
      campaignId: String(formData.get('campaignId') ?? '') || null,
      restaurantId: String(formData.get('restaurantId') ?? ''),
      subscriberId: String(formData.get('subscriberId') ?? '') || null,
      redemptionCode: String(formData.get('redemptionCode') ?? '') || null,
      method: String(formData.get('method') ?? 'manual'),
      notes: String(formData.get('notes') ?? '') || null,
    },
  });
}

export default async function RedemptionsPage() {
  const [events, deals, restaurants, campaigns] = await Promise.all([
    db.redemptionEvent.findMany({ include: { deal: true, restaurant: true, campaign: true }, orderBy: { createdAt: 'desc' } }),
    db.deal.findMany(),
    db.restaurant.findMany(),
    db.campaign.findMany(),
  ]);

  return (
    <div className="grid">
      <form action={addManual} className="card grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        <h3 style={{ gridColumn: '1 / -1' }}>Manual redemption log</h3>
        <div><label>Deal</label><select name="dealId">{deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
        <div><label>Restaurant</label><select name="restaurantId">{restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
        <div><label>Campaign (optional)</label><select name="campaignId"><option value="">-</option>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label>Subscriber ID (optional)</label><input name="subscriberId" /></div>
        <div><label>Code (optional)</label><input name="redemptionCode" /></div>
        <div><label>Method</label><input name="method" defaultValue="manual" /></div>
        <div style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea name="notes" /></div>
        <button className="btn" type="submit" style={{ gridColumn: '1 / -1' }}>Save redemption</button>
      </form>

      <div className="card">
        <h3>Redemption events</h3>
        <table><thead><tr><th>Date</th><th>Deal</th><th>Restaurant</th><th>Campaign</th><th>Method</th></tr></thead><tbody>
          {events.map(e => <tr key={e.id}><td>{new Date(e.createdAt).toLocaleString()}</td><td>{e.deal.title}</td><td>{e.restaurant.name}</td><td>{e.campaign?.name || '-'}</td><td>{e.method}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
