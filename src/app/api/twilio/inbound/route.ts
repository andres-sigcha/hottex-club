import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSms } from '@/lib/sms';
import { verifyTwilioSignature } from '@/lib/twilio-verify';

export async function POST(req: Request) {
  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);
  const form: Record<string, string> = {};
  params.forEach((value, key) => (form[key] = value));

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const url = `${proto}://${host}/api/twilio/inbound`;

  const isValid = verifyTwilioSignature({
    url,
    params: form,
    signature: req.headers.get('x-twilio-signature'),
  });

  if (!isValid) return new NextResponse('', { status: 403 });

  const from = params.get('From') ?? '';
  const to = params.get('To') ?? '';
  const inbound = (params.get('Body') ?? '').trim().toUpperCase();

  const sub = await db.subscriber.findUnique({ where: { phone: from } });

  if (!sub) return new NextResponse('', { status: 200 });

  await db.messageEvent.create({
    data: {
      subscriberId: sub.id,
      direction: 'INBOUND',
      type: 'SYSTEM',
      body: inbound,
      status: 'received',
      fromNumber: from,
      toNumber: to,
    },
  });

  if (inbound === 'STOP') {
    await db.subscriber.update({ where: { id: sub.id }, data: { status: 'UNSUBSCRIBED', consentStatus: 'REVOKED', unsubscribedAt: new Date() } });
    await db.consentLog.create({ data: { subscriberId: sub.id, eventType: 'STOP', message: 'Inbound STOP command', source: 'twilio-webhook' } });
    await sendSms({ to: from, body: 'You are unsubscribed. Reply START to rejoin.', subscriberId: sub.id, type: 'STOP' }).catch(() => {});
  } else if (inbound === 'HELP') {
    await sendSms({ to: from, body: 'HotText Club help: local daily deals by SMS. Reply STOP to unsubscribe.', subscriberId: sub.id, type: 'HELP' }).catch(() => {});
  } else if (inbound === 'START') {
    await db.subscriber.update({ where: { id: sub.id }, data: { status: 'ACTIVE', consentStatus: 'ACTIVE', unsubscribedAt: null } });
    await db.consentLog.create({ data: { subscriberId: sub.id, eventType: 'START', message: 'Inbound START command', source: 'twilio-webhook' } });
  }

  return new NextResponse('', { status: 200 });
}
