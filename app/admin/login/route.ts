import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionValue,
  verifyAdminPassword,
} from '@/lib/admin-auth';

export async function POST(
  request: Request
) {
  const formData = await request.formData();
  const password = String(
    formData.get('password') ?? ''
  );

  const redirectUrl = new URL(
    '/admin',
    request.url
  );

  if (!verifyAdminPassword(password)) {
    redirectUrl.searchParams.set(
      'error',
      '1'
    );

    return NextResponse.redirect(
      redirectUrl
    );
  }

  const response = NextResponse.redirect(
    redirectUrl
  );

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: getAdminSessionValue(),
    httpOnly: true,
    sameSite: 'lax',
    secure:
      process.env.NODE_ENV ===
      'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return response;
}