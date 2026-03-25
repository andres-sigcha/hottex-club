import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeCampaignSend } from '@/lib/campaign-send';

export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const due = await db.campaign.findMany({
    where: {
      status: 'SCHEDULED',
      sendAt: { lte: new Date() },
    },
    select: { id: true },
    take: 25,
  });

  let sent = 0;
  for (const c of due) {
    await executeCampaignSend(c.id);
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
