export function getLocationLabel(locationCode: string) {
  const match = /^BLD-([A-Z]+)-F(\d+)-Z(\d+)$/i.exec(locationCode);
  if (!match) return `จุดแจ้งเหตุ ${locationCode}`;
  return `อาคาร ${match[1].toUpperCase()} · ชั้น ${match[2]} · โซน ${match[3]}`;
}

export function getLocationDetails(locationCode: string) {
  const match = /^BLD-([A-Z]+)-F(\d+)-Z(\d+)$/i.exec(locationCode);
  if (!match) return { building: "ไม่ระบุอาคาร", floor: "ไม่ระบุชั้น", assetName: locationCode };
  return { building: `อาคาร ${match[1].toUpperCase()}`, floor: `ชั้น ${match[2]}`, assetName: `โซน ${match[3]}` };
}

export function formatBangkokDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}
