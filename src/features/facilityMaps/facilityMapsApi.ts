import { apiFetch } from "../api/apiClient";
import { supabase } from "../../lib/supabase/client";

export type FloorPlanElementType = "room" | "area" | "asset" | "label";

export type FloorPlanElement = {
  id: string;
  type: FloorPlanElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fontSize?: number;
  locationId: string | null;
  parentId?: string | null;
};

export type FloorPlanBackground = {
  bucket: string;
  objectPath: string;
  fileName: string;
};

type FloorPlanResponse = {
  id: string;
  building: string;
  floor: string;
  name: string;
  canvas_width: number;
  canvas_height: number;
  background_bucket: string | null;
  background_object_path: string | null;
  background_file_name: string | null;
  background_url: string | null;
  layout: { elements: FloorPlanElement[] };
  version: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type FloorPlan = {
  id: string;
  building: string;
  floor: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  background: FloorPlanBackground | null;
  backgroundUrl: string | null;
  elements: FloorPlanElement[];
  version: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveFloorPlanInput = {
  id?: string;
  building: string;
  floor: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  background: FloorPlanBackground | null;
  elements: FloorPlanElement[];
  isPublished: boolean;
};

const toFloorPlan = (plan: FloorPlanResponse): FloorPlan => ({
  id: plan.id,
  building: plan.building,
  floor: plan.floor,
  name: plan.name,
  canvasWidth: plan.canvas_width,
  canvasHeight: plan.canvas_height,
  background:
    plan.background_bucket && plan.background_object_path && plan.background_file_name
      ? {
          bucket: plan.background_bucket,
          objectPath: plan.background_object_path,
          fileName: plan.background_file_name,
        }
      : null,
  backgroundUrl: plan.background_url,
  elements: plan.layout?.elements ?? [],
  version: plan.version,
  isPublished: plan.is_published,
  createdAt: plan.created_at,
  updatedAt: plan.updated_at,
});

export async function getFloorPlans() {
  const response = await apiFetch<{ data: FloorPlanResponse[] }>("/floor-plans");
  return response.data.map(toFloorPlan);
}

export async function getFloorPlan(id: string) {
  const response = await apiFetch<{ data: FloorPlanResponse }>(`/floor-plans/${id}`);
  return toFloorPlan(response.data);
}

export async function uploadFloorPlanBackground(file: File) {
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบ");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("รองรับเฉพาะ JPG, PNG และ WebP");
  }
  if (file.size > 8 * 1024 * 1024) throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 8 MB");
  const signed = await apiFetch<{
    data: { bucket: string; objectPath: string; token: string };
  }>("/uploads/floor-plan-images", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });
  const { error } = await supabase.storage
    .from(signed.data.bucket)
    .uploadToSignedUrl(signed.data.objectPath, signed.data.token, file, {
      contentType: file.type,
    });
  if (error) throw new Error(error.message);
  return {
    bucket: signed.data.bucket,
    objectPath: signed.data.objectPath,
    fileName: file.name,
  } satisfies FloorPlanBackground;
}

export async function saveFloorPlan(input: SaveFloorPlanInput) {
  const response = await apiFetch<{ data: FloorPlanResponse }>(
    "/admin/floor-plans",
    {
      method: "POST",
      body: JSON.stringify({
        id: input.id,
        building: input.building,
        floor: input.floor,
        name: input.name,
        canvasWidth: input.canvasWidth,
        canvasHeight: input.canvasHeight,
        background: input.background,
        layout: { elements: input.elements },
        isPublished: input.isPublished,
      }),
    },
  );
  return toFloorPlan(response.data);
}
