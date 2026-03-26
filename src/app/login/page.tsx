import { redirect } from 'next/navigation';
import { loginAdmin } from '@/lib/auth';

async function login(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const ok = await loginAdmin(email, password);
  if (ok) redirect('/admin');
  redirect('/login?error=1');
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="wrap" style={{ maxWidth: 520 }}>
      <section className="hero stack" style={{ marginBottom: 12 }}>
        <span className="badge">Operator Console</span>
        <h2>HotText Admin Login</h2>
        <p className="muted">Manage restaurants, deals, sends, and performance reporting.</p>
      </section>

      {searchParams.error && <p style={{ color: 'crimson', marginBottom: 10 }}>Invalid credentials</p>}

      <form action={login} className="card grid">
        <div><label>Email</label><input name="email" defaultValue="admin@hottext.club" required /></div>
        <div><label>Password</label><input type="password" name="password" defaultValue="admin123!" required /></div>
        <button className="btn" type="submit">Log in</button>
      </form>
    </main>
  );
}
