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
    <main className="wrap" style={{ maxWidth: 480 }}>
      <h1>Admin login</h1>
      {searchParams.error && <p style={{ color: 'crimson' }}>Invalid credentials</p>}
      <form action={login} className="card grid">
        <div><label>Email</label><input name="email" defaultValue="admin@hottext.club" required /></div>
        <div><label>Password</label><input type="password" name="password" defaultValue="admin123!" required /></div>
        <button className="btn" type="submit">Log in</button>
      </form>
    </main>
  );
}
