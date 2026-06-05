import { createHash, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE =
  'plena_admin_session';

function safeCompare(
  left: string,
  right: string
): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (
    leftBuffer.length !==
    rightBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    leftBuffer,
    rightBuffer
  );
}

export function getAdminPassword() {
  return (
    process.env.ADMIN_PANEL_PASSWORD?.trim() ??
    ''
  );
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

export function verifyAdminPassword(
  candidate: string
) {
  const configuredPassword =
    getAdminPassword();

  if (!configuredPassword) {
    return false;
  }

  return safeCompare(
    candidate,
    configuredPassword
  );
}

export function getAdminSessionValue() {
  return createHash('sha256')
    .update(getAdminPassword())
    .digest('hex');
}

export function isAdminSessionValid(
  cookieValue?: string
) {
  if (
    !cookieValue ||
    !isAdminPasswordConfigured()
  ) {
    return false;
  }

  return safeCompare(
    cookieValue,
    getAdminSessionValue()
  );
}