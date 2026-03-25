import { db } from '@/lib/db';
import QRCode from 'qrcode';

async function createDeal(formData: FormData) {
  'use server';
  const marketIds = formData.getAll('marketIds').map(String);
  await db.deal.create({
    data: {
      title: String(formData.get('title') ?? ''),
      shortOfferText: String(formData.get('shortOfferText') ?? ''),
      redemptionType: String(formData.get('redemptionType') ?? 'SHOW_TEXT') as any,
      redemptionInstructions: String(formData.get('redemptionInstructions') ?? ''),
      validFrom: new Date(String(formData.get('validFrom'))),
      validTo: new Date(String(formData.get('validTo'))),
      restaurantId: String(formData.get('restaurantId') ?? ''),
      status: String(formData.get('status') ?? 'DRAFT') as any,
      sharedPromoCode: String(formData.get('sharedPromoCode') ?? '') || null,
      markets: { connect: marketIds.map((id) => ({ id })) },
    },
  });
}

export default async function DealsPage() {
  const [deals, restaurants, markets] = await Promise.all([
    db.deal.findMany({ include: { restaurant: true, markets: true }, orderBy: { createdAt: 'desc' } }),
    db.restaurant.findMany({ where: { active: true } }),
    db.market.findMany({ where: { active: true } }),
  ]);

  const qrSamples = await Promise.all(
    deals.slice(0, 3).map(async (d) => ({ id: d.id, dataUrl: await QRCode.toDataURL(`https://example.com/deal/${d.id}`) }))
  );

  return (
    <div className="grid">
      <form action={createDeal} className="card grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        <h3 style={{ gridColumn: '1 / -1' }}>Create deal</h3>
        <div><label>Restaurant</label><select name="restaurantId">{restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
        <div><label>Title</label><input name="title" required /></div>
        <div><label>Short offer text</label><input name="shortOfferText" required /></div>
        <div><label>Redemption type</label><select name="redemptionType"><option>UNIQUE_CODE</option><option>SHARED_CODE</option><option>QR_PAGE</option><option>SHOW_TEXT</option></select></div>
        <div><label>Shared promo code (optional)</label><input name="sharedPromoCode" /></div>
        <div><label>Status</label><select name="status"><option>DRAFT</option><option>SCHEDULED</option></select></div>
        <div><label>Valid from</label><input type="datetime-local" name="validFrom" required /></div>
        <div><label>Valid to</label><input type="datetime-local" name="validTo" required /></div>
        <div style={{ gridColumn: '1 / -1' }}><label>Instructions</label><textarea name="redemptionInstructions" required/></div>
        <div style={{ gridColumn: '1 / -1' }}><label>Target markets</label>
          {markets.map(m => <label key={m.id} style={{display:'inline-block', marginRight:12}}><input type="checkbox" name="marketIds" value={m.id} /> {m.cluster}</label>)}
        </div>
        <button className="btn" type="submit" style={{ gridColumn: '1 / -1' }}>Save deal</button>
      </form>

      <div className="card">
        <h3>Deals</h3>
        <table><thead><tr><th>Title</th><th>Restaurant</th><th>Status</th><th>Markets</th></tr></thead><tbody>
          {deals.map(d => <tr key={d.id}><td>{d.title}</td><td>{d.restaurant.name}</td><td>{d.status}</td><td>{d.markets.map(m => m.cluster).join(', ')}</td></tr>)}
        </tbody></table>
        <h4>QR preview</h4>
        <div style={{display:'flex', gap:12}}>{qrSamples.map(s => <img key={s.id} src={s.dataUrl} alt="qr" width={90} height={90} />)}</div>
      </div>
    </div>
  );
}
