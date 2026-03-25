import { db } from '@/lib/db';

async function save(formData: FormData) {
  'use server';
  const phone = String(formData.get('phone') ?? '');
  const cuisine = String(formData.get('cuisine') ?? '');
  const dietary = String(formData.get('dietary') ?? '');
  const sub = await db.subscriber.findUnique({ where: { phone } });
  if (!sub) return;
  const pref = await db.subscriberPreference.findFirst({ where: { subscriberId: sub.id } });
  if (pref) {
    await db.subscriberPreference.update({ where: { id: pref.id }, data: { cuisine, dietary } });
  } else {
    await db.subscriberPreference.create({ data: { subscriberId: sub.id, cuisine, dietary } });
  }
}

export default function PreferencesPage() {
  return (
    <main className="wrap">
      <h1>Update preferences</h1>
      <form className="card grid" action={save}>
        <div><label>Phone</label><input name="phone" required /></div>
        <div><label>Cuisine</label><input name="cuisine" /></div>
        <div><label>Dietary</label><input name="dietary" /></div>
        <button className="btn" type="submit">Save</button>
      </form>
    </main>
  );
}
