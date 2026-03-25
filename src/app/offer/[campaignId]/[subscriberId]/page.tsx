import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function OfferPage({ params }: { params: { campaignId: string; subscriberId: string } }) {
  const campaign = await db.campaign.findUnique({ where: { id: params.campaignId }, include: { deal: { include: { restaurant: true } } } });
  if (!campaign) return notFound();

  await db.clickEvent.create({
    data: {
      campaignId: campaign.id,
      dealId: campaign.dealId,
      subscriberId: params.subscriberId,
    },
  });

  return (
    <main className="wrap">
      <h1>{campaign.deal.title}</h1>
      <p>{campaign.deal.shortOfferText}</p>
      <div className="card">
        <p><b>Restaurant:</b> {campaign.deal.restaurant.name}</p>
        <p><b>Redeem:</b> {campaign.deal.redemptionInstructions}</p>
      </div>
      <form action="/api/redeem" method="post" className="card grid" style={{ marginTop: 12 }}>
        <input type="hidden" name="campaignId" value={campaign.id} />
        <input type="hidden" name="dealId" value={campaign.dealId} />
        <input type="hidden" name="subscriberId" value={params.subscriberId} />
        <input type="hidden" name="restaurantId" value={campaign.deal.restaurantId} />
        <div><label>Optional code shown in store</label><input name="redemptionCode" /></div>
        <button className="btn" type="submit">Mark redeemed</button>
      </form>
    </main>
  );
}
