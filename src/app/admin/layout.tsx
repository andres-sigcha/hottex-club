import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect('/login');

  return (
    <main className="wrap">
      <h1>HotText Admin</h1>
      <div className="topnav">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/restaurants">Restaurants</Link>
        <Link href="/admin/deals">Deals</Link>
        <Link href="/admin/campaigns">Campaigns</Link>
        <Link href="/admin/subscribers">Subscribers</Link>
        <Link href="/admin/redemptions">Redemptions</Link>
        <Link href="/admin/reports">Reports</Link>
        <Link href="/admin/settings">Settings</Link>
      </div>
      {children}
    </main>
  );
}
