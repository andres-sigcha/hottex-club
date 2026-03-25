import { db } from '@/lib/db';
import { getTargetSubscribers } from '@/lib/targeting';
import { suggestSmsCopy } from '@/lib/copy-suggest';
import { executeCampaignSend } from '@/lib/campaign-send';

async function createCampaign(formData: FormData) {
  'use server';
  const dealId = String(formData.get('dealId') ?? '');
  const marketIds = formData.getAll('marketIds').map(String);
  const zipRaw = String(formData.get('zipCodes') ?? '');
  const zipCodes = zipRaw ? zipRaw.split(',').map((z) => z.trim()).filter(Boolean) : [];
  const sendNow = formData.get('sendNow') === 'on';

  const deal = await db.deal.findUnique({ where: { id: dealId }, include: { markets: true } });
  if (!deal) return;

  const body = String(formData.get('smsBody') ?? '') || suggestSmsCopy(deal.title, deal.shortOfferText, deal.markets[0]?.cluster ?? 'local');

  const campaign = await db.campaign.create({
    data: {
      name: String(formData.get('name') ?? `Campaign for ${deal.title}`),
      smsBody: body,
      dealId,
      status: sendNow ? 'SENDING' : 'SCHEDULED',
      sendAt: sendNow ? null : new Date(String(formData.get('sendAt') ?? new Date().toISOString())),
    },
  });

  const recipients = await getTargetSubscribers({ marketIds, zipCodes });
  for (const r of recipients) {
    await db.campaignRecipient.create({ data: { campaignId: campaign.id, subscriberId: r.id, status: 'queued' } });
  }

  if (sendNow) {
    await executeCampaignSend(campaign.id);
  }
}

export default async function CampaignsPage() {
  const [campaigns, deals, markets] = await Promise.all([
    db.campaign.findMany({ include: { deal: true, recipients: true }, orderBy: { createdAt: 'desc' } }),
    db.deal.findMany({ include: { markets: true }, where: { status: { in: ['DRAFT', 'SCHEDULED', 'SENT'] } } }),
    db.market.findMany({ where: { active: true } }),
  ]);

  return (
    <div className="grid">
      <form action={createCampaign} className="card grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        <h3 style={{ gridColumn: '1 / -1' }}>Compose campaign</h3>
        <div><label>Name</label><input name="name" required /></div>
        <div><label>Deal</label><select name="dealId">{deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
        <div><label>Schedule (optional)</label><input type="datetime-local" name="sendAt" /></div>
        <div style={{ gridColumn: '1 / -1' }}><label>SMS body</label><textarea name="smsBody" placeholder="Use {{link}} token for tracked URL." /></div>
        <div style={{ gridColumn: '1 / -1' }}><label>Markets</label>{markets.map(m => <label key={m.id} style={{display:'inline-block', marginRight:12}}><input type="checkbox" name="marketIds" value={m.id} /> {m.cluster}</label>)}</div>
        <div style={{ gridColumn: '1 / -1' }}><label>Optional zip filter (comma separated)</label><input name="zipCodes" placeholder="85017,85251" /></div>
        <label style={{ gridColumn: '1 / -1' }}><input type="checkbox" name="sendNow" /> Send now</label>
        <button className="btn" type="submit" style={{ gridColumn: '1 / -1' }}>Save / Send campaign</button>
      </form>

      <div className="card">
        <h3>Campaigns</h3>
        <table><thead><tr><th>Name</th><th>Deal</th><th>Status</th><th>Recipients</th><th>Sent</th></tr></thead><tbody>
          {campaigns.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.deal.title}</td><td>{c.status}</td><td>{c.recipients.length}</td><td>{c.sentAt ? new Date(c.sentAt).toLocaleString() : '-'}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
