import { db } from '@/lib/db';

export default async function AdminDashboard() {
  const [totalSubscribers, activeSubscribers, unsubscribed, sends, clicks, redemptions, campaigns] = await Promise.all([
    db.subscriber.count(),
    db.subscriber.count({ where: { status: 'ACTIVE', consentStatus: 'ACTIVE' } }),
    db.subscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
    db.messageEvent.count({ where: { type: 'CAMPAIGN', direction: 'OUTBOUND' } }),
    db.clickEvent.count(),
    db.redemptionEvent.count(),
    db.campaign.findMany({ include: { deal: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const unsubRate = totalSubscribers ? ((unsubscribed / totalSubscribers) * 100).toFixed(1) : '0';

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
      <div className="card"><div className="kpi">{totalSubscribers}</div><div>Total subscribers</div></div>
      <div className="card"><div className="kpi">{activeSubscribers}</div><div>Active subscribers</div></div>
      <div className="card"><div className="kpi">{sends}</div><div>Total sends</div></div>
      <div className="card"><div className="kpi">{clicks}</div><div>Clicks</div></div>
      <div className="card"><div className="kpi">{redemptions}</div><div>Redemptions</div></div>
      <div className="card"><div className="kpi">{unsubRate}%</div><div>Unsubscribe rate</div></div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>Recent campaigns</h3>
        <table><thead><tr><th>Name</th><th>Status</th><th>Deal</th></tr></thead><tbody>
          {campaigns.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.status}</td><td>{c.deal.title}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
