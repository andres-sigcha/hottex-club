import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function run() {
  const market = await db.market.findFirst();
  const deal = await db.deal.findFirst();
  if (!market || !deal) throw new Error('Seed data missing');

  const subscriber = await db.subscriber.create({
    data: {
      phone: `+1480888${Math.floor(1000 + Math.random() * 8999)}`,
      zipCode: '85014',
      source: 'e2e-smoke',
      marketId: market.id,
      consentStatus: 'ACTIVE',
      status: 'ACTIVE',
      optedInAt: new Date(),
      confirmedAt: new Date(),
    },
  });

  const campaign = await db.campaign.create({
    data: {
      name: 'E2E smoke campaign',
      smsBody: 'HotText smoke test {{link}}',
      dealId: deal.id,
      status: 'SENT',
      sentAt: new Date(),
    },
  });

  await db.campaignRecipient.create({
    data: {
      campaignId: campaign.id,
      subscriberId: subscriber.id,
      status: 'sent',
      sentAt: new Date(),
    },
  });

  await db.messageEvent.create({
    data: {
      campaignId: campaign.id,
      subscriberId: subscriber.id,
      direction: 'OUTBOUND',
      type: 'CAMPAIGN',
      body: 'HotText smoke test',
      status: 'dev-simulated',
      fromNumber: 'dev',
      toNumber: subscriber.phone,
    },
  });

  await db.clickEvent.create({ data: { campaignId: campaign.id, dealId: deal.id, subscriberId: subscriber.id } });
  await db.redemptionEvent.create({
    data: {
      campaignId: campaign.id,
      dealId: deal.id,
      subscriberId: subscriber.id,
      restaurantId: deal.restaurantId,
      method: 'manual',
    },
  });

  const metrics = {
    subscribers: await db.subscriber.count(),
    campaigns: await db.campaign.count(),
    clicks: await db.clickEvent.count(),
    redemptions: await db.redemptionEvent.count(),
  };

  console.log(JSON.stringify({ ok: true, metrics, campaignId: campaign.id }, null, 2));
}

run().finally(async () => db.$disconnect());
