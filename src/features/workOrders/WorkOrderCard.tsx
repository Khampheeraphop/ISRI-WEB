import { AddAPhotoOutlined, BuildOutlined, LocationOnOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Collapse, Divider, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { MainCard } from "../../components/base/MainCard";
import { ImageUploadField } from "../../components/form/fields/ImageUploadField";
import { PriorityRibbon } from "../../components/PriorityRibbon";
import { SlaCountdown } from "../../components/SlaCountdown";
import type { Incident } from "../../types/incident";
import type { WorkOrder, WorkOrderStatus } from "../../types/workOrder";
import { formatBangkokDate } from "../../utils/incident";
import { workOrderStatusDetail } from "./workOrder.constants";

interface WorkOrderCardProps { workOrder: WorkOrder; incident: Incident; onStatusChange: (nextStatus: WorkOrderStatus) => void; onSaveRepairPhotos: (files: File[]) => void; isUpdating: boolean; }

export function WorkOrderCard({ workOrder, incident, onStatusChange, onSaveRepairPhotos, isUpdating }: WorkOrderCardProps) {
  const [showPhotos, setShowPhotos] = useState(false);
  const [repairFiles, setRepairFiles] = useState<File[]>([]);
  const status = workOrderStatusDetail[workOrder.status];
  const overdue = new Date(workOrder.resolveDueAt).getTime() < Date.now();
  return <MainCard sx={{ position: "relative", overflow: "hidden" }}><PriorityRibbon urgency={incident.urgencyReported} /><Stack spacing={2}><Box sx={{ pr: { xs: 8, sm: 11 } }}><Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}><Typography variant="h5">{incident.category}</Typography><Chip label={status.label} color={status.color} size="small" variant="outlined" /><Typography variant="body2" color="text.secondary">{incident.ticketNumber}</Typography></Stack><Typography sx={{ mt: 1 }}>{incident.description}</Typography></Box><Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 1, md: 3 }} color="text.secondary"><Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}><LocationOnOutlined fontSize="small" /><Typography variant="body2">{incident.locationLabel}</Typography></Stack><Typography variant="body2">แจ้งเมื่อ {formatBangkokDate(incident.createdAt)} น.</Typography></Stack><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><>{workOrder.status === "pending" && <SlaCountdown dueAt={workOrder.respondDueAt} label="ตอบรับ" />}</><SlaCountdown dueAt={workOrder.resolveDueAt} label="แก้ไข" /></Stack>{overdue && <Alert severity="error">งานนี้เกินกำหนด SLA แล้ว กรุณาเร่งดำเนินการและบันทึกความคืบหน้า</Alert>}<Divider /><Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ justifyContent: "flex-end" }}><Button variant="outlined" startIcon={<AddAPhotoOutlined />} onClick={() => setShowPhotos((open) => !open)}>{showPhotos ? "ซ่อนช่องแนบรูป" : "แนบรูปหลังซ่อม"}</Button>{status.next && <Button variant="contained" startIcon={<BuildOutlined />} disabled={isUpdating} onClick={() => onStatusChange(status.next!)}>{status.nextLabel}</Button>}</Stack><Collapse in={showPhotos}><Box sx={{ pt: 1 }}><ImageUploadField label="รูปหลังซ่อม" files={repairFiles} onChange={setRepairFiles} /><Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1.5 }}><Button size="small" disabled={!repairFiles.length || isUpdating} onClick={() => { onSaveRepairPhotos(repairFiles); setRepairFiles([]); setShowPhotos(false); }}>บันทึกรูปหลังซ่อม</Button></Stack></Box></Collapse></Stack></MainCard>;
}
