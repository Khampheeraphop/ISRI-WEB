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

export function clearAuthReturnTo() {
  window.sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
}
