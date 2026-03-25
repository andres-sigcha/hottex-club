import { db } from './db';
import { getTargetSubscribers } from './targeting';
import { sendSms } from './sms';

export async function executeCampaignSend(campaignId: string) {
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: { deal: { include: { markets: true } } },
  });
  if (!campaign) throw new Error('Campaign not found');

  const recipients = await db.campaignRecipient.findMany({
    where: { campaignId },
    include: { subscriber: true },
  });

  if (!recipients.length) {
    const targeted = await getTargetSubscribers({ marketIds: campaign.deal.markets.map((m) => m.id) });
    for (const t of targeted) {
      await db.campaignRecipient.create({ data: { campaignId, subscriberId: t.id, status: 'queued' } });
      recipients.push({
        id: `generated-${t.id}`,
        campaignId,
        subscriberId: t.id,
        status: 'queued',
        sentAt: null,
        deliveredAt: null,
        clickedAt: null,
        redeemedAt: null,
        createdAt: new Date(),
        subscriber: t,
      } as any);
    }
  }

  await db.campaign.update({ where: { id: campaign.id }, data: { status: 'SENDING' } });

  for (const r of recipients) {
    if (r.subscriber.status !== 'ACTIVE' || r.subscriber.consentStatus !== 'ACTIVE') {
      await db.campaignRecipient.updateMany({ where: { campaignId, subscriberId: r.subscriberId }, data: { status: 'suppressed' } });
      continue;
    }

    const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/offer/${campaign.id}/${r.subscriberId}`;
    const body = campaign.smsBody.includes('{{link}}')
      ? campaign.smsBody.replace('{{link}}', link)
      : `${campaign.smsBody} ${link}`;

    try {
      await sendSms({ to: r.subscriber.phone, body, campaignId: campaign.id, subscriberId: r.subscriberId });
      await db.campaignRecipient.updateMany({ where: { campaignId, subscriberId: r.subscriberId }, data: { status: 'sent', sentAt: new Date() } });
      await db.subscriber.update({
        where: { id: r.subscriberId },
        data: { totalMessagesSent: { increment: 1 }, lastMessageSentAt: new Date() },
      });
    } catch {
      await db.campaignRecipient.updateMany({ where: { campaignId, subscriberId: r.subscriberId }, data: { status: 'failed' } });
    }
  }

  await db.campaign.update({ where: { id: campaign.id }, data: { status: 'SENT', sentAt: new Date() } });
  await db.deal.update({ where: { id: campaign.dealId }, data: { status: 'SENT' } });
}
