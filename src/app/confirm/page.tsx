import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { sendSms } from '@/lib/sms';

async function confirm(formData: FormData) {
  'use server';
  const phone = String(formData.get('phone') ?? '');
  const code = String(formData.get('code') ?? '');
  const sub = await db.subscriber.findUnique({ where: { phone } });
  if (!sub || sub.confirmationCode !== code) return;

  await db.subscriber.update({
    where: { id: sub.id },
    data: { consentStatus: 'ACTIVE', optedInAt: new Date(), confirmedAt: new Date(), confirmationCode: null },
  });

  await db.consentLog.create({ data: { subscriberId: sub.id, eventType: 'DOUBLE_OPT_IN_CONFIRMED', message: 'Subscriber confirmed via code.', source: sub.source } });

  await sendSms({
    to: sub.phone,
    body: 'Welcome to HotText Club! Local deals are on. Reply STOP to opt out or HELP for help.',
    subscriberId: sub.id,
    type: 'WELCOME',
  }).catch(() => {});

  redirect('/thanks');
}

export default async function ConfirmPage({ searchParams }: { searchParams: { phone?: string } }) {
  const phone = searchParams.phone ?? '';
  const sub = phone ? await db.subscriber.findUnique({ where: { phone } }) : null;

  return (
    <main className="wrap">
      <h1>Confirm your opt-in</h1>
      <p className="muted">Enter the confirmation code sent by SMS. For local dev demo, code is shown below.</p>
      {sub?.confirmationCode && <p className="card">Demo code: <b>{sub.confirmationCode}</b></p>}
      <form className="card grid" action={confirm}>
        <input type="hidden" name="phone" value={phone} />
        <div><label>Confirmation code</label><input name="code" required /></div>
        <button className="btn" type="submit">Confirm</button>
      </form>
    </main>
  );
}
