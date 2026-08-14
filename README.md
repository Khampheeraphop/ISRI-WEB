# ISRI Web

เว็บ React + TypeScript + Material UI สำหรับระบบแจ้งปัญหาโครงสร้างพื้นฐานในสถานพยาบาล ใช้ Google OAuth ผ่าน Supabase Auth และเรียก Edge Function ผ่าน React Query

คู่มือเปิด Local, ใช้ Seed, ตั้ง Google OAuth และ Deploy Production แบบละเอียดอยู่ที่ [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## เริ่มใช้งาน

สร้าง `.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable หรือ anon key จาก npx supabase status>
VITE_ENABLE_LOCAL_DEMO_LOGIN=true
```

จากนั้น:

```powershell
npm install
npm run dev
```

เมื่อตั้งค่า Local ตามนี้ หน้าเข้าสู่ระบบจะแสดงแบบฟอร์มสำหรับบัญชีใน `seed.sql` และใช้รหัสผ่าน `IsriDemo123!` ได้ทันที สำหรับ Supabase Cloud เปลี่ยน URL และ publishable key เป็นค่าของโครงการ และตั้ง `VITE_ENABLE_LOCAL_DEMO_LOGIN=false` เพื่อซ่อนแบบฟอร์มทดสอบ ห้ามนำ `service_role` มาใส่ในเว็บ

## หน้าจอและสิทธิ์

- Reporter: รายการของฉัน แจ้งเหตุจาก QR แต้มและรางวัล
- Technician: งานของฉันและแผน PM
- Dispatcher: คิวรอจัดสรร ตรวจสอบความเร่งด่วน มอบหมาย และตรวจรับ
- Admin: Dashboard, SLA, PM, ของรางวัล, การส่งมอบ, แคมเปญ, ผู้ใช้ และ QR

Reporter ไม่เห็น Leaderboard และ Admin ไม่สามารถเข้าหน้า Dispatcher ตามขอบเขตที่กำหนด

Notification ใช้ Supabase Realtime เฉพาะตารางที่เกี่ยวข้อง หากการเชื่อมต่อ Realtime หลุด ผู้ใช้ยังเปิดเมนูหรือโหลดหน้าใหม่เพื่อดึงข้อมูลล่าสุดผ่าน API ได้

## ตรวจคุณภาพ

```powershell
npm run lint
npm run build
```

หน้าเว็บใช้ภาษาไทย (`lang=th`) และชื่อแท็บ ISRI รูปแบบ UI ยึดสีม่วง-ขาว สถานะใช้สีเฉพาะความหมาย ไม่มี gradient/เงาหนัก/องค์ประกอบตกแต่งที่ไม่สื่อข้อมูล ตาม `ai-playbook/project-prompt.md`
