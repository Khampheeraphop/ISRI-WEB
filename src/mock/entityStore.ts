import type { User } from "../types/user";
import type { CreateIncident, Incident } from "../types/incident";
import type { SLARule, WorkOrder } from "../types/workOrder";

export type EntityName = "users" | "incidents" | "slaRules" | "workOrders";
export type EntityMap = { users: User; incidents: Incident; slaRules: SLARule; workOrders: WorkOrder };
type NewEntityMap = { users: Omit<User, "id">; incidents: CreateIncident; slaRules: Omit<SLARule, "id">; workOrders: Omit<WorkOrder, "id"> };

const relativeTime = (minutesFromNow: number) => new Date(Date.now() + minutesFromNow * 60_000).toISOString();

const records: { [K in EntityName]: EntityMap[K][] } = {
  users: [
    { id: "USR-001", name: "คุณศิริพร วัฒนากร", role: "reporter" },
    { id: "USR-002", name: "นายธนกร ช่างทอง", role: "technician" },
    { id: "USR-003", name: "นางสาวกมลวรรณ ศรีสุข", role: "admin" },
  ],
  incidents: [
    {
      id: "INC-001",
      ticketNumber: "ISRI-202608-001",
      locationId: "BLD-A-F2-Z03",
      locationLabel: "อาคาร A · ชั้น 2 · โซน 03",
      category: "เครื่องปรับอากาศ",
      urgencyReported: "urgent",
      description: "เครื่องปรับอากาศบริเวณหน้าห้องตรวจไม่เย็น",
      photoUrls: [],
      reporterId: "USR-001",
      status: "assigned",
      createdAt: "2026-08-05T07:15:00+07:00",
    },
    {
      id: "INC-002",
      ticketNumber: "ISRI-202608-002",
      locationId: "BLD-B-F1-Z01",
      locationLabel: "อาคาร B · ชั้น 1 · โซน 01",
      category: "ไฟฟ้า",
      urgencyReported: "normal",
      description: "หลอดไฟทางเดินกะพริบเป็นบางช่วง",
      photoUrls: ["light-corridor.jpg"],
      reporterId: "USR-001",
      status: "in_progress",
      createdAt: "2026-08-05T09:40:00+07:00",
    },
  ],
  slaRules: [
    { id: "SLA-001", urgencyLevel: "critical", responseMinutes: 30, resolveMinutes: 240 },
    { id: "SLA-002", urgencyLevel: "urgent", responseMinutes: 120, resolveMinutes: 1440 },
    { id: "SLA-003", urgencyLevel: "normal", responseMinutes: 1440, resolveMinutes: 4320 },
  ],
  workOrders: [
    { id: "WO-001", incidentId: "INC-001", technicianId: "USR-002", status: "pending", statusHistory: [{ status: "pending", changedAt: relativeTime(-110) }], respondDueAt: relativeTime(10), resolveDueAt: relativeTime(230), repairPhotoUrls: [] },
    { id: "WO-002", incidentId: "INC-002", technicianId: "USR-002", status: "in_progress", statusHistory: [{ status: "pending", changedAt: relativeTime(-1600) }, { status: "in_progress", changedAt: relativeTime(-1550) }], respondDueAt: relativeTime(-1480), resolveDueAt: relativeTime(-20), repairPhotoUrls: [] },
  ],
};

const clone = <T>(value: T): T => structuredClone(value);
const pause = () => new Promise((resolve) => setTimeout(resolve, 120));
const entityPrefixes: Record<EntityName, string> = {
  users: "USR",
  incidents: "INC",
  slaRules: "SLA",
  workOrders: "WO",
};

export const entityStore = {
  async list<K extends EntityName>(entity: K): Promise<EntityMap[K][]> {
    await pause();
    return clone(records[entity]);
  },
  async create<K extends EntityName>(
    entity: K,
    values: NewEntityMap[K],
  ): Promise<EntityMap[K]> {
    await pause();
    const id = `${entityPrefixes[entity]}-${String(records[entity].length + 1).padStart(3, "0")}`;
    const record =
      entity === "incidents"
        ? {
            ...values,
            id,
            ticketNumber: `ISRI-202608-${String(records.incidents.length + 1).padStart(3, "0")}`,
            status: "submitted",
            createdAt: new Date().toISOString(),
          }
        : { ...values, id };
    records[entity].push(record as EntityMap[K]);
    return clone(record as EntityMap[K]);
  },
  async update<K extends EntityName>(entity: K, id: string, changes: Partial<EntityMap[K]>): Promise<EntityMap[K]> {
    await pause();
    const index = records[entity].findIndex((record) => record.id === id);
    if (index < 0) throw new Error("ไม่พบข้อมูลที่ต้องการแก้ไข");
    records[entity][index] = { ...records[entity][index], ...changes } as EntityMap[K];
    return clone(records[entity][index]);
  },
};
