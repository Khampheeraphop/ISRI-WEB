export function normalizeThaiPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const localDigits =
    digits.startsWith("66") && digits.length > 10
      ? `0${digits.slice(2)}`
      : digits;
  return localDigits.slice(0, 10);
}

export function formatThaiPhoneNumber(value: string) {
  const digits = normalizeThaiPhoneNumber(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isValidThaiMobileNumber(value: string) {
  return /^0[689]\d{8}$/.test(normalizeThaiPhoneNumber(value));
}
