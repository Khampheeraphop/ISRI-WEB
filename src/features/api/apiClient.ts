import { supabase, supabaseUrl } from "../../lib/supabase/client";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!supabase || !supabaseUrl) throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
  const response = await fetch(`${supabaseUrl}/functions/v1/isri-api${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "ไม่สามารถทำรายการได้");
  return payload;
}
