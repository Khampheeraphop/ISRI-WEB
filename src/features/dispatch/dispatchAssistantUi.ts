const specialtyLabelMap: Record<string, string> = {
  electrical: "ช่างไฟฟ้า",
  plumbing: "ช่างประปา",
  air_conditioning: "ช่างเครื่องปรับอากาศ",
  elevator: "ช่างลิฟต์",
  building: "ช่างโครงสร้างและอาคาร",
};

export const specialtyLabels = specialtyLabelMap;

export function formatBangkokDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}
