import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from './db';

const COOKIE_NAME = 'hottext_admin';

export async function loginAdmin(email: string, password: string) {
  const admin = await db.adminUser.findUnique({ where: { email } });
  if (!admin) return false;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return false;

  cookies().set(COOKIE_NAME, admin.id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  return true;
}

export function logoutAdmin() {
  cookies().delete(COOKIE_NAME);
}

export async function requireAdmin() {
  const id = cookies().get(COOKIE_NAME)?.value;
  if (!id) return null;
  return db.adminUser.findUnique({ where: { id } });
}
