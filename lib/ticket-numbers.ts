export function normalizeTicketNumber(
  value: string | number
) {
  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    return 0;
  }

  return Math.trunc(normalized);
}

export function formatTicketNumbers(
  values: Array<string | number>
) {
  return values
    .map((value) =>
      normalizeTicketNumber(value)
    )
    .filter((value) => value > 0)
    .sort((left, right) => left - right)
    .join(' - ');
}