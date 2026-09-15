import { supabase, supabaseUrl } from "../../lib/supabase/client";

export type ChatMessage = { role: "user" | "assistant"; text: string };
export type ChatReply = {
  text: string;
  sources: { label: string; path: string }[];
  fetchedAt: string;
};

async function request<T>(init: RequestInit): Promise<T> {
  if (!supabase || !supabaseUrl)
    throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("กรุณาเข้าสู่ระบบใหม่");
  const response = await fetch(`${supabaseUrl}/functions/v1/isri-chat`, {
    ...init,
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
    },
  });
  let payload: { data: T; error?: string };
  try {
    payload = await response.json();
  } catch {
    throw new Error("เชื่อมต่อผู้ช่วยไม่ได้ กรุณาลองใหม่ภายหลัง");
  }
  if (!response.ok)
    throw new Error(payload.error ?? "ผู้ช่วย AI ยังไม่พร้อมใช้งาน");
  return payload.data;
}

export const getChatAvailability = (signal: AbortSignal) =>
  request<{ enabled: boolean }>({ method: "GET", signal });
export const sendChat = (messages: ChatMessage[], signal: AbortSignal) =>
  request<ChatReply>({
    method: "POST",
    signal,
    body: JSON.stringify({ messages }),
  });

export function isChatSourcePath(path: string) {
  return /^\/(?:$|incidents\/mine$|incidents\/[0-9a-f-]{36}$|dispatch$|dispatch\/reviews$|dispatch\/incidents\/[0-9a-f-]{36}$|work-orders$|work-orders\/[0-9a-f-]{36}$|activity-history\/[0-9a-f-]{36}$|pm$|rewards$|rewards\/manage$|rewards\/redemptions$|users$|campaigns\/manage$)/i.test(
    path,
  );
}
