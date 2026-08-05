import { CheckCircleOutlined } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainCard } from "../components/base/MainCard";
import { IncidentReportForm } from "../features/incidents/report/IncidentReportForm";

export function IncidentReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ticketNumber, setTicketNumber] = useState<string>();
  const locationCode = searchParams.get("loc") || "BLD-A-F2-Z03";

  if (ticketNumber) return <MainCard contentSx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}><CheckCircleOutlined color="success" sx={{ fontSize: 54, mb: 1 }} /><Typography variant="h4">รับแจ้งเรื่องเรียบร้อย</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>เจ้าหน้าที่จะตรวจสอบและอัปเดตสถานะให้ทราบ</Typography><Box sx={{ my: 3, py: 2, bgcolor: "#F4F1FA", borderRadius: 1.5 }}><Typography variant="body2" color="text.secondary">เลขที่ใบแจ้งเหตุ</Typography><Typography variant="h5" color="primary.main">{ticketNumber}</Typography></Box><Button variant="contained" onClick={() => navigate("/incidents/mine")}>ดูเรื่องที่ฉันแจ้ง</Button></MainCard>;

  return <Box><Typography variant="h3">แจ้งปัญหา</Typography><Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>กรุณาระบุข้อมูลให้ครบถ้วน เพื่อให้เจ้าหน้าที่ดำเนินการได้รวดเร็ว</Typography><IncidentReportForm locationCode={locationCode} onSubmitted={setTicketNumber} /></Box>;
}
