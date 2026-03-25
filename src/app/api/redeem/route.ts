import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const formData = await req.formData();
  const dealId = String(formData.get('dealId') ?? '');
  const campaignId = String(formData.get('campaignId') ?? '') || null;
  const subscriberId = String(formData.get('subscriberId') ?? '') || null;
  const restaurantId = String(formData.get('restaurantId') ?? '');
  const redemptionCode = String(formData.get('redemptionCode') ?? '') || null;

  await db.redemptionEvent.create({
    data: {
      dealId,
      campaignId,
      subscriberId,
      restaurantId,
      redemptionCode,
      method: 'offer-landing',
    },
  });

  if (subscriberId) {
    await db.subscriber.update({ where: { id: subscriberId }, data: { totalRedemptions: { increment: 1 } } }).catch(() => {});
  }

  return NextResponse.redirect(new URL('/thanks', req.url));
}
