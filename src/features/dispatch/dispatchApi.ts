import { apiFetch } from "../api/apiClient";
import { toIncident, type IncidentDetail } from "../incidents/incidentsApi";
import type { MyWorkOrder } from "../workOrders/workOrdersApi";
import type { UrgencyLevel } from "../../types/incident";
import { supabase, supabaseUrl } from "../../lib/supabase/client";

export type DispatchIncident = {
  id: string;
  ticket_number: string;
  location_label: string;
  asset_name: string | null;
  category: string;
  urgency_reported: "critical" | "urgent" | "normal";
  description: string;
  created_at: string;
};
export type DispatchTechnician = {
  id: string;
  full_name: string;
  email: string;
  technician_specialties: string[];
};
export type DispatchSlaRule = {
  urgencyLevel: UrgencyLevel;
  responseMinutes: number;
  resolveMinutes: number;
  pointValue: number;
};

type AiIncidentAssessmentResponse = {
  id: string;
  incident_id: string;
  provider: string;
  model: string;
  prompt_version: string;
  summary: string;
  category_suggested: string;
  suggested_urgency: UrgencyLevel | null;
  confidence: number | string;
  detected_hazards: string[];
  evidence: string[];
  missing_information: string[];
  rule_reasons: string[];
  needs_human_review: boolean;
  input_attachment_count: number;
  latency_ms: number;
  created_at: string;
};

export type AiIncidentAssessment = {
  id: string;
  incidentId: string;
  provider: string;
  model: string;
  promptVersion: string;
  summary: string;
  categorySuggested: string;
  suggestedUrgency: UrgencyLevel | null;
  confidence: number;
  detectedHazards: string[];
  evidence: string[];
  missingInformation: string[];
  ruleReasons: string[];
  needsHumanReview: boolean;
  inputAttachmentCount: number;
  latencyMs: number;
  createdAt: string;
};

export type AiIncidentAssessmentState = {
  assessment: AiIncidentAssessment | null;
  configured: boolean;
};

const toAiIncidentAssessment = (
  assessment: AiIncidentAssessmentResponse,
): AiIncidentAssessment => ({
  id: assessment.id,
  incidentId: assessment.incident_id,
  provider: assessment.provider,
  model: assessment.model,
  promptVersion: assessment.prompt_version,
  summary: assessment.summary,
  categorySuggested: assessment.category_suggested,
  suggestedUrgency: assessment.suggested_urgency,
  confidence: Number(assessment.confidence),
  detectedHazards: assessment.detected_hazards,
  evidence: assessment.evidence,
  missingInformation: assessment.missing_information,
  ruleReasons: assessment.rule_reasons,
  needsHumanReview: assessment.needs_human_review,
  inputAttachmentCount: assessment.input_attachment_count,
  latencyMs: assessment.latency_ms,
  createdAt: assessment.created_at,
});

async function aiAssessmentFetch<T>(
  incidentId: string,
  method: "GET" | "POST",
): Promise<T> {
  if (!supabase || !supabaseUrl) {
    throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
  }
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
  const response = await fetch(
    `${supabaseUrl}/functions/v1/isri-ai-assessment?incidentId=${encodeURIComponent(incidentId)}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "ไม่สามารถวิเคราะห์เหตุได้");
  }
  return payload;
}

export async function getDispatchIncidents() {
  return (await apiFetch<{ data: DispatchIncident[] }>("/dispatch/incidents"))
    .data;
}
export async function getDispatchIncidentDetail(
  id: string,
): Promise<IncidentDetail> {
  const result = await apiFetch<{
    data: {
      id: string;
      ticket_number: string;
      location_id: string;
      location_label: string;
      asset_name: string | null;
      category: IncidentDetail["category"];
      other_category: string | null;
      urgency_reported: IncidentDetail["urgencyReported"];
      description: string;
      status: IncidentDetail["status"];
      created_at: string;
      attachments: IncidentDetail["attachments"];
    };
  }>(`/dispatch/incidents/${id}`);
  return { ...toIncident(result.data), attachments: result.data.attachments };
}
export async function getDispatchTechnicians() {
  return (
    await apiFetch<{ data: DispatchTechnician[] }>("/dispatch/technicians")
  ).data;
}
export async function getDispatchSlaRules(): Promise<DispatchSlaRule[]> {
  const result = await apiFetch<{
    data: Array<{
      urgency_level: UrgencyLevel;
      response_minutes: number;
      resolve_minutes: number;
      point_value: number;
    }>;
  }>("/dispatch/sla-rules");
  return result.data.map((rule) => ({
    urgencyLevel: rule.urgency_level,
    responseMinutes: rule.response_minutes,
    resolveMinutes: rule.resolve_minutes,
    pointValue: rule.point_value,
  }));
}

export async function getLatestAiIncidentAssessment(
  incidentId: string,
): Promise<AiIncidentAssessmentState> {
  const result = await aiAssessmentFetch<{
    data: AiIncidentAssessmentResponse | null;
    meta?: { configured?: boolean };
  }>(incidentId, "GET");
  return {
    assessment: result.data ? toAiIncidentAssessment(result.data) : null,
    configured: result.meta?.configured ?? true,
  };
}

export async function createAiIncidentAssessment(
  incidentId: string,
): Promise<AiIncidentAssessment> {
  const result = await aiAssessmentFetch<{
    data: AiIncidentAssessmentResponse;
  }>(incidentId, "POST");
  return toAiIncidentAssessment(result.data);
}
export async function assignWorkOrder(input: {
  incidentId: string;
  primaryTechnicianId: string;
  supportTechnicianIds: string[];
  urgencyVerified: "critical" | "urgent" | "normal";
}) {
  return (
    await apiFetch<{ data: { id: string } }>("/dispatch/work-orders", {
      method: "POST",
      body: JSON.stringify(input),
    })
  ).data;
}

export async function rejectDispatchIncident(input: {
  incidentId: string;
  reason: string;
}) {
  return (
    await apiFetch<{ data: { id: string; status: "rejected" } }>(
      `/dispatch/incidents/${input.incidentId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reason: input.reason }),
      },
    )
  ).data;
}

export async function getDispatchReviews() {
  return (await apiFetch<{ data: MyWorkOrder[] }>("/dispatch/reviews")).data;
}
