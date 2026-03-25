import { db } from '@/lib/db';

async function createRestaurant(formData: FormData) {
  'use server';
  await db.restaurant.create({
    data: {
      name: String(formData.get('name') ?? ''),
      address1: String(formData.get('address1') ?? ''),
      city: String(formData.get('city') ?? ''),
      zipCode: String(formData.get('zipCode') ?? ''),
      cuisine: String(formData.get('cuisine') ?? ''),
      contactName: String(formData.get('contactName') ?? ''),
      contactEmail: String(formData.get('contactEmail') ?? ''),
      contactPhone: String(formData.get('contactPhone') ?? ''),
      marketId: String(formData.get('marketId') ?? ''),
      active: formData.get('active') === 'on',
    },
  });
}

export default async function RestaurantsPage() {
  const [restaurants, markets] = await Promise.all([
    db.restaurant.findMany({ include: { market: true }, orderBy: { createdAt: 'desc' } }),
    db.market.findMany({ where: { active: true } }),
  ]);

  return (
    <div className="grid">
      <form action={createRestaurant} className="card grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        <h3 style={{ gridColumn: '1 / -1' }}>Create restaurant</h3>
        <div><label>Name</label><input name="name" required/></div>
        <div><label>Address</label><input name="address1" required/></div>
        <div><label>City</label><input name="city" required/></div>
        <div><label>Zip</label><input name="zipCode" required/></div>
        <div><label>Cuisine</label><input name="cuisine" required/></div>
        <div><label>Market</label><select name="marketId">{markets.map(m => <option key={m.id} value={m.id}>{m.cluster}</option>)}</select></div>
        <div><label>Contact Name</label><input name="contactName" /></div>
        <div><label>Contact Email</label><input name="contactEmail" /></div>
        <div><label>Contact Phone</label><input name="contactPhone" /></div>
        <label style={{ gridColumn: '1 / -1' }}><input type="checkbox" name="active" defaultChecked /> Active</label>
        <button className="btn" type="submit" style={{ gridColumn: '1 / -1' }}>Save</button>
      </form>

      <div className="card">
        <h3>Restaurants</h3>
        <table><thead><tr><th>Name</th><th>City</th><th>Cluster</th><th>Cuisine</th><th>Status</th></tr></thead><tbody>
          {restaurants.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.city}</td><td>{r.market.cluster}</td><td>{r.cuisine}</td><td>{r.active ? 'active' : 'inactive'}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
