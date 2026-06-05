function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const normalized = Math.trunc(parsed);

  if (normalized < 1) {
    return fallback;
  }

  return normalized;
}

export function getCurrentRaffleId() {
  return parsePositiveInteger(
    process.env.RAFFLE_ID ?? process.env.NEXT_PUBLIC_RAFFLE_ID,
    1
  );
}

export function getTotalBoletas() {
  return parsePositiveInteger(
    process.env.TOTAL_BOLETAS ?? process.env.NEXT_PUBLIC_TOTAL_BOLETAS,
    700
  );
}
