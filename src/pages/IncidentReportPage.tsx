import { CheckCircleOutlined, QrCodeScannerOutlined } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainCard } from "../components/base/MainCard";
import { IncidentReportForm } from "../features/incidents/report/IncidentReportForm";
import { isLocationCode } from "../utils/incident";

export function IncidentReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ticketNumber, setTicketNumber] = useState<string>();
  const locationCode = searchParams.get("loc");

  if (ticketNumber) return <MainCard contentSx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}><CheckCircleOutlined color="success" sx={{ fontSize: 54, mb: 1 }} /><Typography variant="h4">รับแจ้งเรื่องเรียบร้อย</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>เจ้าหน้าที่จะตรวจสอบและอัปเดตสถานะให้ทราบ</Typography><Box sx={{ my: 3, py: 2, bgcolor: "#F4F1FA", borderRadius: 1.5 }}><Typography variant="body2" color="text.secondary">เลขที่ใบแจ้งเหตุ</Typography><Typography variant="h5" color="primary.main">{ticketNumber}</Typography></Box><Button variant="contained" onClick={() => navigate("/incidents/mine")}>ดูเรื่องที่ฉันแจ้ง</Button></MainCard>;

  if (!isLocationCode(locationCode)) return <Box><Typography variant="h3">แจ้งปัญหา</Typography><Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>หน้านี้เปิดได้จาก QR Code ของจุดแจ้งเหตุเท่านั้น</Typography><MainCard contentSx={{ p: { xs: 3, md: 5 } }}><Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}><QrCodeScannerOutlined color="primary" sx={{ fontSize: 48 }} /><Typography variant="h5">กรุณาสแกน QR Code ที่จุดแจ้งเหตุ</Typography><Typography color="text.secondary">สแกน QR Code ที่ติดอยู่กับอาคารหรืออุปกรณ์ เพื่อระบุจุดแจ้งเหตุให้ถูกต้องก่อนกรอกข้อมูล</Typography></Stack></MainCard></Box>;

  return <Box><Typography variant="h3">แจ้งปัญหา</Typography><Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>กรุณาระบุข้อมูลให้ครบถ้วน เพื่อให้เจ้าหน้าที่ดำเนินการได้รวดเร็ว</Typography><IncidentReportForm locationCode={locationCode} onSubmitted={setTicketNumber} /></Box>;
}
