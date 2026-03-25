import { db } from '@/lib/db';

async function save(formData: FormData) {
  'use server';
  const setting = await db.setting.findFirst();
  if (!setting) return;
  await db.setting.update({
    where: { id: setting.id },
    data: {
      quietHoursStart: Number(formData.get('quietHoursStart') ?? 21),
      quietHoursEnd: Number(formData.get('quietHoursEnd') ?? 8),
      twilioFromNumber: String(formData.get('twilioFromNumber') ?? ''),
      optInTemplate: String(formData.get('optInTemplate') ?? ''),
      welcomeTemplate: String(formData.get('welcomeTemplate') ?? ''),
      helpTemplate: String(formData.get('helpTemplate') ?? ''),
      stopTemplate: String(formData.get('stopTemplate') ?? ''),
    },
  });
}

export default async function SettingsPage() {
  const setting = await db.setting.findFirst();
  if (!setting) return <div className="card">No settings found</div>;

  return (
    <form action={save} className="card grid">
      <h3>Settings</h3>
      <div><label>Quiet hours start (0-23)</label><input name="quietHoursStart" defaultValue={setting.quietHoursStart} /></div>
      <div><label>Quiet hours end (0-23)</label><input name="quietHoursEnd" defaultValue={setting.quietHoursEnd} /></div>
      <div><label>Twilio From Number</label><input name="twilioFromNumber" defaultValue={setting.twilioFromNumber ?? ''} /></div>
      <div><label>Opt-in template</label><textarea name="optInTemplate" defaultValue={setting.optInTemplate} /></div>
      <div><label>Welcome template</label><textarea name="welcomeTemplate" defaultValue={setting.welcomeTemplate} /></div>
      <div><label>HELP template</label><textarea name="helpTemplate" defaultValue={setting.helpTemplate} /></div>
      <div><label>STOP template</label><textarea name="stopTemplate" defaultValue={setting.stopTemplate} /></div>
      <button className="btn" type="submit">Save settings</button>
    </form>
  );
}
