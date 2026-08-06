import { AccessTimeOutlined, ErrorOutlineOutlined } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { useEffect, useState } from "react";

function formatRemaining(milliseconds: number) {
  const minutes = Math.ceil(Math.abs(milliseconds) / 60_000);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours} ชม. ${minutes % 60} นาที` : `${minutes} นาที`;
}

export function SlaCountdown({ dueAt, label }: { dueAt: string; label: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const interval = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(interval); }, []);
  const remaining = new Date(dueAt).getTime() - now;
  const overdue = remaining < 0;
  const warning = !overdue && remaining < 60 * 60 * 1000;
  return <Chip icon={overdue ? <ErrorOutlineOutlined /> : <AccessTimeOutlined />} label={overdue ? `${label}: เกิน ${formatRemaining(remaining)}` : `${label}: เหลือ ${formatRemaining(remaining)}`} color={overdue ? "error" : warning ? "warning" : "success"} size="small" variant="outlined" />;
}
