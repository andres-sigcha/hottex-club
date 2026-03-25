import { db } from '@/lib/db';

export default async function ReportsPage() {
  const restaurants = await db.restaurant.findMany({ include: { deals: true } });

  const rows = await Promise.all(restaurants.map(async (r) => {
    const dealIds = r.deals.map(d => d.id);
    const sends = await db.messageEvent.count({ where: { campaign: { dealId: { in: dealIds } }, type: 'CAMPAIGN' } });
    const clicks = await db.clickEvent.count({ where: { dealId: { in: dealIds } } });
    const redemptions = await db.redemptionEvent.count({ where: { restaurantId: r.id } });
    const ctr = sends ? ((clicks / sends) * 100) : 0;
    const rr = sends ? ((redemptions / sends) * 100) : 0;
    const cpa = redemptions ? (120 / redemptions) : 0; // MVP placeholder spend model.
    return { name: r.name, sends, clicks, redemptions, ctr: ctr.toFixed(1), rr: rr.toFixed(1), cpa: cpa.toFixed(2) };
  }));

  return (
    <div className="card">
      <h3>Partner ROI summary</h3>
      <p className="muted">Export-friendly performance snapshot by restaurant.</p>
      <table><thead><tr><th>Restaurant</th><th>Sends</th><th>Clicks</th><th>CTR</th><th>Redemptions</th><th>Redemption Rate</th><th>Est. CPA</th></tr></thead><tbody>
        {rows.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.sends}</td><td>{r.clicks}</td><td>{r.ctr}%</td><td>{r.redemptions}</td><td>{r.rr}%</td><td>${r.cpa}</td></tr>)}
      </tbody></table>
    </div>
  );
}
