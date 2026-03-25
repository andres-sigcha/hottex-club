import twilio from 'twilio';

export function verifyTwilioSignature({
  url,
  params,
  signature,
}: {
  url: string;
  params: Record<string, string>;
  signature: string | null;
}) {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return true; // dev fallback when Twilio is not configured
  if (!signature) return false;
  return twilio.validateRequest(token, signature, url, params);
}
