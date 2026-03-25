import twilio from 'twilio';
import { db } from './db';

function isQuietHours(date = new Date()) {
  const hour = date.getHours();
  const start = Number(process.env.QUIET_HOURS_START ?? 21);
  const end = Number(process.env.QUIET_HOURS_END ?? 8);
  return hour >= start || hour < end;
}

export async function sendSms({ to, body, subscriberId, campaignId, type = 'CAMPAIGN' }: { to: string; body: string; subscriberId?: string; campaignId?: string; type?: 'CAMPAIGN'|'WELCOME'|'OPTIN_CONFIRM'|'HELP'|'STOP'|'SYSTEM'; }) {
  // Compliance: suppress in quiet hours unless explicitly bypassed by admin/system.
  if (!process.env.ALLOW_QUIET_HOUR_SENDS && isQuietHours()) {
    throw new Error('Blocked by quiet hours setting');
  }

  const from = process.env.TWILIO_FROM_NUMBER;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  let twilioSid: string | undefined;
  let status = 'queued';

  if (from && sid && token) {
    const client = twilio(sid, token);
    const msg = await client.messages.create({ from, to, body });
    twilioSid = msg.sid;
    status = msg.status ?? 'sent';
  } else {
    // Dev fallback: keep app functional without external SMS credentials.
    status = 'dev-simulated';
  }

  await db.messageEvent.create({
    data: {
      subscriberId,
      campaignId,
      twilioSid,
      direction: 'OUTBOUND',
      type,
      body,
      status,
      fromNumber: from ?? 'dev-from-number',
      toNumber: to,
    },
  });

  return { twilioSid, status };
}
