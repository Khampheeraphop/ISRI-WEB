import { apiFetch } from "../api/apiClient";
import type { SLARule } from "../../types/workOrder";

type SlaRuleResponse = {
  id: string;
  urgency_level: SLARule["urgencyLevel"];
  response_minutes: number;
  resolve_minutes: number;
  point_value: number;
};

const toRule = (item: SlaRuleResponse): SLARule => ({
  id: item.id,
  urgencyLevel: item.urgency_level,
  responseMinutes: item.response_minutes,
  resolveMinutes: item.resolve_minutes,
  pointValue: item.point_value,
});

export async function getSlaRules() {
  const result = await apiFetch<{ data: SlaRuleResponse[] }>("/sla/rules");
  return result.data.map(toRule);
}

export async function updateSlaRule(input: {
  id: string;
  responseMinutes: number;
  resolveMinutes: number;
  pointValue: number;
}) {
  const result = await apiFetch<{ data: SlaRuleResponse }>(
    `/sla/rules/${input.id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return toRule(result.data);
}

export async function getSlaSummary() {
  return apiFetch<{ data: { overdueCount: number; generatedAt: string } }>(
    "/sla/summary",
  );
}
