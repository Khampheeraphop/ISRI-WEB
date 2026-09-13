export function formatThaiDateInput(value?: string | null) {
  if (!value) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return `${day}/${month}/${Number(year) + 543}`;
}
