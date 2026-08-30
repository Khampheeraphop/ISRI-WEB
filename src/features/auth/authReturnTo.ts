export const AUTH_RETURN_TO_KEY = "isri-auth-return-to";

function isSafeInternalPath(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export function saveAuthReturnTo(returnTo: string) {
  window.sessionStorage.setItem(
    AUTH_RETURN_TO_KEY,
    isSafeInternalPath(returnTo) ? returnTo : "/",
  );
}

export function getAuthReturnTo() {
  const value = window.sessionStorage.getItem(AUTH_RETURN_TO_KEY);
  return isSafeInternalPath(value) ? value : null;
}

// QR reporting is the only login journey that must resume an exact page after
// authentication. Other saved URLs may belong to the account that just signed
// out, so restoring them would expose a broken or unauthorized screen.
export function getQrReportReturnTo() {
  const value = getAuthReturnTo();
  if (!value) return null;
  const queryIndex = value.indexOf("?");
  if (queryIndex < 0 || value.slice(0, queryIndex) !== "/incidents/new")
    return null;
  return new URLSearchParams(value.slice(queryIndex + 1)).has("loc")
    ? value
    : null;
}

export function clearAuthReturnTo() {
  window.sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
}
