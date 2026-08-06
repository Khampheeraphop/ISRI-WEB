import type { User } from "../types/user";
import type { CreateIncident, Incident } from "../types/incident";
import type { CreateManagedLocation, ManagedLocation } from "../types/location";
import type { SLARule, WorkOrder } from "../types/workOrder";
import type { CreatePMSchedule, PMLog, PMSchedule } from "../types/pm";
import type {
  CreateRewardItem,
  PointTransaction,
  PointWallet,
  RewardItem,
  RewardRedemption,
  FileStorage,
  CampaignScore,
  CreateRewardCampaign,
  RewardCampaign,
} from "../types/reward";

export type EntityName =
  | "users"
  | "locations"
  | "incidents"
  | "slaRules"
  | "workOrders"
  | "pointWallets"
  | "pointTransactions"
  | "rewardItems"
  | "rewardRedemptions"
  | "rewardCampaigns"
  | "campaignScores"
  | "pmSchedules"
  | "pmLogs"
  | "fileStorages";
export type EntityMap = {
  users: User;
  locations: ManagedLocation;
  incidents: Incident;
  slaRules: SLARule;
  workOrders: WorkOrder;
  pointWallets: PointWallet;
  pointTransactions: PointTransaction;
  rewardItems: RewardItem;
  rewardRedemptions: RewardRedemption;
  rewardCampaigns: RewardCampaign;
  campaignScores: CampaignScore;
  pmSchedules: PMSchedule;
  pmLogs: PMLog;
  fileStorages: FileStorage;
};
type NewEntityMap = {
  users: Omit<User, "id">;
  locations: CreateManagedLocation;
  incidents: CreateIncident;
  slaRules: Omit<SLARule, "id">;
  workOrders: Omit<WorkOrder, "id">;
  pointWallets: Omit<PointWallet, "id">;
  pointTransactions: Omit<PointTransaction, "id">;
  rewardItems: CreateRewardItem;
  rewardRedemptions: Omit<RewardRedemption, "id">;
  rewardCampaigns: CreateRewardCampaign;
  campaignScores: Omit<CampaignScore, "id">;
  pmSchedules: CreatePMSchedule;
  pmLogs: Omit<PMLog, "id">;
  fileStorages: Omit<FileStorage, "id">;
};

const relativeTime = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60_000).toISOString();
const addMonths = (date: string, months: number) => {
  const value = new Date(date);
  value.setMonth(value.getMonth() + months);
  return value.toISOString();
};

const records: { [K in EntityName]: EntityMap[K][] } = {
  users: [
    { id: "USR-001", name: "คุณศิริพร วัฒนากร", role: "reporter" },
    { id: "USR-002", name: "นายธนกร ช่างทอง", role: "technician" },
    { id: "USR-003", name: "นางสาวกมลวรรณ ศรีสุข", role: "admin" },
    { id: "USR-004", name: "นางสาวพิมพ์ชนก แสนดี", role: "reporter" },
  ],
  locations: [
    {
      id: "LOC-001",
      code: "BLD-A-F2-Z03",
      building: "อาคาร A",
      floor: "ชั้น 2",
      zone: "โซน 03",
      assetName: "เครื่องปรับอากาศหน้าห้องตรวจ",
    },
    {
      id: "LOC-002",
      code: "BLD-B-F1-Z01",
      building: "อาคาร B",
      floor: "ชั้น 1",
      zone: "โซน 01",
      assetName: "ตู้ควบคุมไฟฟ้าทางเดิน",
    },
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
    {
      id: "SLA-001",
      urgencyLevel: "critical",
      responseMinutes: 30,
      resolveMinutes: 240,
    },
    {
      id: "SLA-002",
      urgencyLevel: "urgent",
      responseMinutes: 120,
      resolveMinutes: 1440,
    },
    {
      id: "SLA-003",
      urgencyLevel: "normal",
      responseMinutes: 1440,
      resolveMinutes: 4320,
    },
  ],
  workOrders: [
    {
      id: "WO-001",
      incidentId: "INC-001",
      technicianId: "USR-002",
      status: "pending",
      statusHistory: [{ status: "pending", changedAt: relativeTime(-110) }],
      respondDueAt: relativeTime(10),
      resolveDueAt: relativeTime(230),
      repairPhotoUrls: [],
    },
    {
      id: "WO-002",
      incidentId: "INC-002",
      technicianId: "USR-002",
      status: "in_progress",
      statusHistory: [
        { status: "pending", changedAt: relativeTime(-1600) },
        { status: "in_progress", changedAt: relativeTime(-1550) },
      ],
      respondDueAt: relativeTime(-1480),
      resolveDueAt: relativeTime(-20),
      repairPhotoUrls: [],
    },
  ],
  pmSchedules: [
    {
      id: "PMS-001",
      locationId: "BLD-A-F2-Z03",
      locationLabel: "อาคาร A · ชั้น 2 · โซน 03",
      assetName: "เครื่องปรับอากาศหน้าห้องตรวจ",
      intervalMonths: 3,
      lastDoneAt: "2026-05-08T09:00:00+07:00",
      nextDueAt: "2026-08-08T09:00:00+07:00",
    },
    {
      id: "PMS-002",
      locationId: "BLD-B-F1-Z01",
      locationLabel: "อาคาร B · ชั้น 1 · โซน 01",
      assetName: "ตู้ควบคุมไฟฟ้าทางเดิน",
      intervalMonths: 6,
      lastDoneAt: "2026-02-01T09:00:00+07:00",
      nextDueAt: "2026-08-01T09:00:00+07:00",
    },
  ],
  pmLogs: [
    {
      id: "PML-001",
      scheduleId: "PMS-001",
      completedAt: "2026-05-08T09:00:00+07:00",
      technicianId: "USR-002",
      notes: "ล้างแผงกรองและตรวจสอบแรงดันน้ำยาแล้ว",
    },
  ],
  pointWallets: [{ id: "WAL-001", userId: "USR-001", balance: 120 }],
  pointTransactions: [
    {
      id: "PTX-001",
      userId: "USR-001",
      amount: 80,
      type: "earn",
      reason: "แจ้งเหตุที่ได้รับการยืนยัน",
      refIncidentId: "INC-HIST-001",
      createdAt: "2026-07-28T10:00:00+07:00",
    },
    {
      id: "PTX-002",
      userId: "USR-001",
      amount: 40,
      type: "earn",
      reason: "แจ้งเหตุที่ได้รับการยืนยัน",
      refIncidentId: "INC-HIST-002",
      createdAt: "2026-08-01T14:30:00+07:00",
    },
  ],
  fileStorages: [
    {
      id: "FST-001",
      fileName: "stainless-tumbler.png",
      mimeType: "image/png",
      sizeBytes: 1578246,
      publicUrl: "/images/rewards/stainless-tumbler.png",
      uploadedAt: "2026-08-05T10:19:12+07:00",
    },
    {
      id: "FST-002",
      fileName: "beverage-voucher.png",
      mimeType: "image/png",
      sizeBytes: 1080732,
      publicUrl: "/images/rewards/beverage-voucher.png",
      uploadedAt: "2026-08-05T10:19:31+07:00",
    },
    {
      id: "FST-003",
      fileName: "folding-umbrella.png",
      mimeType: "image/png",
      sizeBytes: 1042169,
      publicUrl: "/images/rewards/folding-umbrella.png",
      uploadedAt: "2026-08-05T10:19:50+07:00",
    },
    {
      id: "FST-004",
      fileName: "annual-backpack.png",
      mimeType: "image/png",
      sizeBytes: 1735563,
      publicUrl: "/images/rewards/annual-backpack.png",
      uploadedAt: "2026-08-05T10:20:40+07:00",
    },
  ],
  rewardItems: [
    {
      id: "RWD-001",
      name: "แก้วน้ำสแตนเลส ISRI",
      description: "แก้วเก็บอุณหภูมิสำหรับใช้งานประจำวัน",
      pointCost: 80,
      stock: 12,
      isActive: true,
      imageFileStorageId: "FST-001",
      rewardPeriod: "standard",
    },
    {
      id: "RWD-002",
      name: "คูปองเครื่องดื่ม",
      description: "แลกรับเครื่องดื่มภายในโรงพยาบาล",
      pointCost: 40,
      stock: 20,
      isActive: true,
      imageFileStorageId: "FST-002",
      rewardPeriod: "standard",
    },
    {
      id: "RWD-003",
      name: "ร่มพับ",
      description: "ร่มพับขนาดพกพา",
      pointCost: 120,
      stock: 0,
      isActive: true,
      imageFileStorageId: "FST-003",
      rewardPeriod: "standard",
    },
    {
      id: "RWD-004",
      name: "กระเป๋าเป้รางวัลประจำปี",
      description: "ของรางวัลสำหรับรอบแคมเปญประจำปี",
      pointCost: 300,
      stock: 3,
      isActive: true,
      imageFileStorageId: "FST-004",
      rewardPeriod: "annual",
    },
  ],
  rewardCampaigns: [
    {
      id: "CMP-001",
      name: "ผู้แจ้งเหตุเชิงรุก ประจำเดือนสิงหาคม",
      periodType: "monthly",
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      prizeDescription: "เกียรติบัตรและของรางวัลสำหรับผู้มีคะแนนสูงสุด",
      status: "active",
    },
  ],
  campaignScores: [
    {
      id: "CS-001",
      campaignId: "CMP-001",
      userId: "USR-001",
      points: 80,
      lastScoredAt: "2026-08-04T10:30:00+07:00",
    },
    {
      id: "CS-002",
      campaignId: "CMP-001",
      userId: "USR-004",
      points: 65,
      lastScoredAt: "2026-08-04T14:15:00+07:00",
    },
  ],
  rewardRedemptions: [],
};

const clone = <T>(value: T): T => structuredClone(value);
const pause = () => new Promise((resolve) => setTimeout(resolve, 120));
const entityPrefixes: Record<EntityName, string> = {
  users: "USR",
  locations: "LOC",
  incidents: "INC",
  slaRules: "SLA",
  workOrders: "WO",
  pointWallets: "WAL",
  pointTransactions: "PTX",
  rewardItems: "RWD",
  rewardRedemptions: "RDM",
  rewardCampaigns: "CMP",
  campaignScores: "CS",
  pmSchedules: "PMS",
  pmLogs: "PML",
  fileStorages: "FST",
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
        : entity === "pmSchedules"
          ? {
              ...values,
              id,
              nextDueAt: addMonths(
                (values as CreatePMSchedule).lastDoneAt,
                (values as CreatePMSchedule).intervalMonths,
              ),
            }
          : { ...values, id };
    records[entity].push(record as EntityMap[K]);
    return clone(record as EntityMap[K]);
  },
  async update<K extends EntityName>(
    entity: K,
    id: string,
    changes: Partial<EntityMap[K]>,
  ): Promise<EntityMap[K]> {
    await pause();
    const index = records[entity].findIndex((record) => record.id === id);
    if (index < 0) throw new Error("ไม่พบข้อมูลที่ต้องการแก้ไข");
    records[entity][index] = {
      ...records[entity][index],
      ...changes,
    } as EntityMap[K];
    return clone(records[entity][index]);
  },
  async remove<K extends EntityName>(entity: K, id: string): Promise<void> {
    await pause();
    const index = records[entity].findIndex((record) => record.id === id);
    if (index < 0) throw new Error("ไม่พบข้อมูลที่ต้องการลบ");
    records[entity].splice(index, 1);
  },
  async redeemReward(
    userId: string,
    rewardItemId: string,
  ): Promise<RewardRedemption> {
    await pause();
    const reward = records.rewardItems.find((item) => item.id === rewardItemId);
    const wallet = records.pointWallets.find((item) => item.userId === userId);
    if (!reward || !reward.isActive)
      throw new Error("ของรางวัลนี้ไม่พร้อมให้แลก");
    if (reward.stock < 1) throw new Error("ของรางวัลหมดแล้ว");
    if (!wallet || wallet.balance < reward.pointCost)
      throw new Error("แต้มคงเหลือไม่เพียงพอ");

    reward.stock -= 1;
    wallet.balance -= reward.pointCost;
    const redemption: RewardRedemption = {
      id: `RDM-${String(records.rewardRedemptions.length + 1).padStart(3, "0")}`,
      userId,
      rewardItemId,
      redeemedAt: new Date().toISOString(),
    };
    records.rewardRedemptions.push(redemption);
    records.pointTransactions.push({
      id: `PTX-${String(records.pointTransactions.length + 1).padStart(3, "0")}`,
      userId,
      amount: -reward.pointCost,
      type: "redeem",
      reason: `แลกรางวัล: ${reward.name}`,
      refRewardItemId: reward.id,
      createdAt: redemption.redeemedAt,
    });
    return clone(redemption);
  },
  async completeWorkOrder(workOrderId: string): Promise<WorkOrder> {
    await pause();
    const workOrder = records.workOrders.find(
      (item) => item.id === workOrderId,
    );
    if (!workOrder) throw new Error("ไม่พบใบสั่งงาน");
    const incident = records.incidents.find(
      (item) => item.id === workOrder.incidentId,
    );
    if (!incident) throw new Error("ไม่พบรายการแจ้งซ่อม");
    if (workOrder.status === "done") return clone(workOrder);

    workOrder.status = "done";
    workOrder.statusHistory = [
      ...workOrder.statusHistory,
      { status: "done", changedAt: new Date().toISOString() },
    ];
    incident.status = "done";

    const alreadyAwarded = records.pointTransactions.some(
      (transaction) =>
        transaction.refIncidentId === incident.id &&
        transaction.type === "earn",
    );
    if (!alreadyAwarded) {
      const amount =
        incident.urgencyReported === "critical"
          ? 30
          : incident.urgencyReported === "urgent"
            ? 20
            : 10;
      let wallet = records.pointWallets.find(
        (item) => item.userId === incident.reporterId,
      );
      if (!wallet) {
        wallet = {
          id: `WAL-${String(records.pointWallets.length + 1).padStart(3, "0")}`,
          userId: incident.reporterId,
          balance: 0,
        };
        records.pointWallets.push(wallet);
      }
      wallet.balance += amount;
      records.pointTransactions.push({
        id: `PTX-${String(records.pointTransactions.length + 1).padStart(3, "0")}`,
        userId: incident.reporterId,
        amount,
        type: "earn",
        reason: "แจ้งเหตุที่ได้รับการยืนยันและดำเนินการเสร็จสิ้น",
        refIncidentId: incident.id,
        createdAt: new Date().toISOString(),
      });
      const today = new Date().toISOString().slice(0, 10);
      records.rewardCampaigns
        .filter(
          (campaign) =>
            campaign.status === "active" &&
            campaign.startDate <= today &&
            campaign.endDate >= today,
        )
        .forEach((activeCampaign) => {
          const score = records.campaignScores.find(
            (item) =>
              item.campaignId === activeCampaign.id &&
              item.userId === incident.reporterId,
          );
          if (score) {
            score.points += amount;
            score.lastScoredAt = new Date().toISOString();
          } else
            records.campaignScores.push({
              id: `CS-${String(records.campaignScores.length + 1).padStart(3, "0")}`,
              campaignId: activeCampaign.id,
              userId: incident.reporterId,
              points: amount,
              lastScoredAt: new Date().toISOString(),
            });
        });
    }
    return clone(workOrder);
  },
  async endCampaign(campaignId: string): Promise<RewardCampaign> {
    await pause();
    const campaign = records.rewardCampaigns.find(
      (item) => item.id === campaignId,
    );
    if (!campaign) throw new Error("ไม่พบแคมเปญที่ต้องการ");
    if (campaign.status === "ended") return clone(campaign);
    campaign.status = "ended";
    return clone(campaign);
  },
  async completePMSchedule({
    scheduleId,
    technicianId,
    notes,
  }: {
    scheduleId: string;
    technicianId: string;
    notes: string;
  }): Promise<PMSchedule> {
    await pause();
    const schedule = records.pmSchedules.find((item) => item.id === scheduleId);
    if (!schedule) throw new Error("ไม่พบตาราง PM");
    const completedAt = new Date().toISOString();
    records.pmLogs.push({
      id: `PML-${String(records.pmLogs.length + 1).padStart(3, "0")}`,
      scheduleId,
      technicianId,
      notes,
      completedAt,
    });
    schedule.lastDoneAt = completedAt;
    schedule.nextDueAt = addMonths(completedAt, schedule.intervalMonths);
    return clone(schedule);
  },
};
