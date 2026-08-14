# คู่มือเปิดใช้งานและ Deploy ระบบ ISRI

คู่มือนี้อ้างอิงโครงสร้างของโครงการปัจจุบัน:

- `web` คือ React/Vite Single Page Application (SPA)
- `api` คือ Supabase migrations, seed, Auth, Storage, Realtime และ Edge Function `isri-api`
- Browser ใช้เฉพาะ Supabase URL และ Publishable Key
- `service_role` ใช้เฉพาะภายใน Edge Function และห้ามใส่ในตัวแปร `VITE_*`

## 1. ระบบทำงานร่วมกันอย่างไร

```text
Browser / QR Code
       |
       v
หน้าเว็บ Vite (Local หรือ Hosting)
       |-- Google OAuth / Local password --> Supabase Auth
       |-- Bearer token -------------------> Edge Function isri-api
                                                |
                                                v
                                      PostgreSQL + Storage + Realtime
```

Supabase ไม่ได้ทำหน้าที่ host หน้าเว็บนี้ หน้าเว็บต้องเปิดด้วย Vite ใน Local หรือ deploy โฟลเดอร์ `dist` ไปยัง Netlify ส่วน URL `https://<project-ref>.supabase.co` เป็น URL ของ Auth, API, Storage และ Edge Function

## 2. เปิดระบบบนเครื่อง Local

### 2.1 โปรแกรมที่ต้องมี

- Docker Desktop และต้องอยู่ในสถานะ Running
- Node.js 22 ขึ้นไป
- npm
- โฟลเดอร์โครงการ `api` และ `web`

ตรวจสอบเบื้องต้น:

```powershell
docker desktop status
node --version
npm --version
```

### 2.2 เปิด Supabase Local

เปิด PowerShell หน้าต่างที่ 1:

```powershell
cd C:\Users\poplo\Desktop\ISRI\api
npx supabase start
```

ครั้งแรก Docker อาจดาวน์โหลด image หลายรายการ ข้อความ `Pull complete` หมายถึงดาวน์โหลด container เสร็จ ไม่ใช่ error

ตรวจสอบ URL และ key:

```powershell
npx supabase status
```

ค่าหลักที่ใช้ใน Local:

- API URL: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Edge Function: `http://127.0.0.1:54321/functions/v1/isri-api`

`supabase start` จะเปิด Edge Function Local ให้ด้วย ไม่จำเป็นต้องนำ `service_role` ไปใส่ในหน้าเว็บ

### 2.3 ล้าง Local และสร้างข้อมูล Seed ใหม่

คำสั่งต่อไปนี้ลบเฉพาะฐานข้อมูล Local แล้วรัน migrations และ `supabase/seed.sql` ใหม่ทั้งหมด:

```powershell
cd C:\Users\poplo\Desktop\ISRI\api
npx supabase db reset
```

ใช้คำสั่งนี้เมื่อ:

- ต้องการกลับสู่ข้อมูลสาธิตเริ่มต้น
- แก้ migration หรือ `seed.sql`
- ทดสอบว่าเครื่องใหม่สร้างระบบได้ครบ

ข้อมูล Seed ปัจจุบันครอบคลุมผู้ใช้ทุกบทบาท สถานะอนุมัติ ตำแหน่ง QR เหตุแจ้งทุกช่วงงาน SLA งานซ่อม PM แต้ม แคมเปญ การแลกรางวัล และ Notification แต่ไม่สร้างรูปภาพ รูปต้องอัปโหลดผ่านหน้าเว็บเอง

หาก reset ครั้งแรกหลังเปิด Docker แล้ว service บางตัวกำลังเริ่ม ให้รอจน `npx supabase status` แสดง URL แล้วสั่ง `npx supabase db reset` อีกครั้ง

### 2.4 ตั้งค่าหน้าเว็บ Local

สร้างหรือแก้ไฟล์ `web/.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY จาก npx supabase status>
VITE_ENABLE_LOCAL_DEMO_LOGIN=true
```

ห้ามใช้ `SECRET_KEY`, `SERVICE_ROLE_KEY` หรือ `SUPABASE_SERVICE_ROLE_KEY` ในไฟล์ `web/.env.local`

เปิด PowerShell หน้าต่างที่ 2:

```powershell
cd C:\Users\poplo\Desktop\ISRI\web
npm ci
npm run dev
```

เปิด URL ที่ Vite แสดง โดยปกติคือ `http://127.0.0.1:5173`

### 2.5 บัญชี Seed สำหรับ Local

ทุกบัญชีใช้รหัสผ่าน `IsriDemo123!`

| สิทธิ์/สถานะ | อีเมล |
|---|---|
| Admin | `admin@isri.local` |
| Dispatcher | `siriporn.dispatcher@isri.local` |
| Technician งานไฟฟ้า/ลิฟต์ | `somchai.electric@isri.local` |
| Technician งานอาคาร | `anucha.maintenance@isri.local` |
| Reporter | `nattaya.nurse@isri.local` |
| Reporter | `kanokwan.records@isri.local` |
| Reporter | `pimchanok.pharmacy@isri.local` |
| รออนุมัติ | `thitiporn.pending@isri.local` |
| ถูกปฏิเสธ | `wittaya.external@isri.local` |

บัญชี Gmail จริง `poplowplay1@gmail.com` ไม่มีรหัสผ่านสาธิต ระบบเก็บอีเมลนี้ใน `bootstrap_admins` และเลื่อนเป็น Admin เมื่อเข้าสู่ระบบด้วย Google บน Cloud เพื่อไม่ให้รหัสผ่าน Admin จริงรั่วจาก repository

### 2.6 ลำดับทดสอบระบบที่แนะนำ

1. เข้า Reporter ด้วย `nattaya.nurse@isri.local` ดูรายการของฉัน Wallet และของรางวัล
2. สร้างเหตุจาก URL `/incidents/new?loc=OPD-F1-REG`
3. เข้า Dispatcher ตรวจระดับความเร่งด่วนและมอบหมาย Technician
4. เข้า Technician เปิดงานและเปลี่ยนสถานะตาม workflow
5. เข้า Dispatcher ตรวจรับและปิดงาน
6. กลับ Reporter ตรวจแต้มที่เพิ่มและแลกรางวัล
7. เข้า Admin เปิดหน้าการส่งมอบ บันทึกส่งมอบหรือยกเลิก
8. เข้า Admin ตรวจ Dashboard, SLA, PM, Campaign, Users และ QR
9. ยืนยันว่า Admin เข้าเมนู Dispatcher ไม่ได้ และ Reporter เข้า Leaderboard ไม่ได้

### 2.7 QR Code ใน Local

QR สร้างจาก `window.location.origin` หากสร้างตอนเปิดเว็บ Local QR จะชี้ไป `127.0.0.1` ซึ่งโทรศัพท์เครื่องอื่นเข้าไม่ได้ ควรสร้างและพิมพ์ QR ชุดใช้งานจริงหลัง deploy หน้าเว็บด้วยโดเมน Production แล้ว

### 2.8 ปิด Local

```powershell
cd C:\Users\poplo\Desktop\ISRI\api
npx supabase stop
```

`stop` ไม่ล้างข้อมูล Local การล้างเกิดเมื่อสั่ง `db reset`

## 3. Deploy ระบบจริง

ตัวอย่างนี้ใช้ Supabase Cloud เดิม project ref:

```text
nzwtybjijnreeylbmjlp
```

โครงการเลือก deploy หน้าเว็บด้วย Netlify เพราะเป็น Vite SPA และไฟล์ `netlify.toml` เตรียม build, publish `dist` และ rewrite ไป `index.html` แล้ว

### 3.1 แยก Production กับ Demo Seed ให้ชัด

Production จริง:

- ใช้ `supabase db push` เท่านั้น
- ห้ามใช้ `--include-seed`
- ไม่ควรมีบัญชี `.local` หรือข้อมูลบุคลากรสาธิตบน Cloud
- ผู้ใช้จริงเข้าสู่ระบบด้วย Google

Demo/Staging ที่ตั้งใจล้างได้:

- ใช้ Seed ได้เฉพาะโครงการแยกจาก Production
- บัญชี Seed มีรหัสผ่านที่อยู่ใน repository จึงไม่ควรเปิดอินเทอร์เน็ตเป็นระบบจริง

### 3.2 สำรองและตรวจโครงการก่อนเปลี่ยนฐานข้อมูล Cloud

ก่อน deploy migration ให้ตรวจว่าเชื่อมโครงการถูกตัว:

```powershell
cd C:\Users\poplo\Desktop\ISRI\api
npx supabase login
npx supabase projects list
npx supabase link --project-ref nzwtybjijnreeylbmjlp
npx supabase migration list
```

หาก Cloud มีข้อมูลสำคัญ ให้สำรองจาก Supabase Dashboard ก่อน อย่าสั่ง `db reset --linked` กับ Production เพราะเป็นการลบข้อมูล Remote

> สถานะโครงการปัจจุบัน: Cloud ชุดแรกถูกสร้างด้วย migration timestamp คนละชุดกับ Local baseline แม้ schema จะมาจากระบบเดียวกัน หาก `migration list` แสดงไฟล์ baseline เก่าทั้งชุดเป็น pending ให้หยุดและอย่า `db push` ฝืน เพราะอาจสร้าง schema ซ้ำ Migration ล่าสุดถึง `grant_isri_api_service_role_privileges` และ Edge Function version 36 ถูกอัปบน Cloud แล้วเมื่อ 14 สิงหาคม 2026 การ deploy ครั้งถัดไปควรสร้าง migration ใหม่ต่อจากไฟล์ล่าสุดและตรวจประวัติกับ Cloud ก่อนทุกครั้ง ส่วนการทำ `migration repair` ควรทำโดยผู้ดูแลที่มี backup เท่านั้น

### 3.3 Deploy migrations โดยไม่ล้างข้อมูล

ขั้นตอนนี้ใช้เมื่อ `migration list` ยืนยันว่า Local และ Remote history ตรงกัน หากเห็น baseline เก่าเป็น pending ให้ทำตามคำเตือนในข้อ 3.2 ก่อน

ดูรายการที่จะเปลี่ยนก่อน:

```powershell
npx supabase db push --dry-run
```

หากรายการถูกต้อง:

```powershell
npx supabase db push
```

คำสั่งนี้รันเฉพาะ migration ที่ Cloud ยังไม่มี ไม่ล้างข้อมูลเดิม และจะเพิ่ม `poplowplay1@gmail.com` เป็น Bootstrap Admin

### 3.4 Deploy Edge Function

```powershell
cd C:\Users\poplo\Desktop\ISRI\api
npx supabase functions deploy isri-api --project-ref nzwtybjijnreeylbmjlp
```

ห้ามใช้ `--no-verify-jwt` เพราะ API นี้ต้องรับ JWT ของผู้ใช้และตรวจสิทธิ์ซ้ำใน Function

Supabase Cloud เตรียม `SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ให้ Edge Function โดยอัตโนมัติ ตัวแปรที่ต้องตั้งเพิ่มหลังทราบ URL หน้าเว็บจริงคือ `WEB_ORIGIN`

ตัวอย่างเมื่อเว็บจริงคือ `https://isri.example.com`:

```powershell
npx supabase secrets set WEB_ORIGIN=https://isri.example.com --project-ref nzwtybjijnreeylbmjlp
```

ค่า `WEB_ORIGIN` ต้องเป็น origin เท่านั้น ไม่มี `/` ต่อท้ายและไม่มี path เช่น `/auth/callback`

### 3.5 ตั้ง Google OAuth

ใน Google Cloud OAuth Client เพิ่ม Authorized redirect URI:

```text
https://nzwtybjijnreeylbmjlp.supabase.co/auth/v1/callback
```

ใน Supabase Dashboard:

1. ไป Authentication → Sign In / Providers → Google
2. เปิด Google provider และใส่ Client ID/Client Secret
3. ไป Authentication → URL Configuration
4. ตั้ง Site URL เป็น origin ของเว็บจริง เช่น `https://isri.example.com`
5. เพิ่ม Redirect URL `https://isri.example.com/auth/callback`
6. หากยังพัฒนา Local ให้คง `http://127.0.0.1:5173/auth/callback` ไว้ด้วย

เมื่อ `poplowplay1@gmail.com` เข้าด้วย Google ครั้งแรก trigger จะสร้าง/ปรับ profile เป็น `approved + admin` อัตโนมัติ ผู้ใช้ Gmail อื่นจะเป็น `pending` และยังทำงานไม่ได้จน Admin อนุมัติ

### 3.6 Deploy หน้าเว็บด้วย Netlify

นำ repository `web` ขึ้น Git provider แล้วเลือก Add new site → Import an existing project ใน Netlify:

- Framework preset: Vite
- Base Directory: ใช้ `.` เพราะ repository `ISRI-WEB` มีหน้าเว็บอยู่ที่ root
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

ตั้ง Environment Variables ใน Netlify สำหรับ Production:

```env
VITE_SUPABASE_URL=https://nzwtybjijnreeylbmjlp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Publishable Key จาก Supabase Dashboard → Settings → API>
VITE_ENABLE_LOCAL_DEMO_LOGIN=false
```

จากนั้น Deploy หน้าเว็บ เมื่อได้ URL จริงให้ย้อนกลับไปทำ 2 จุด:

1. ตั้ง Supabase secret `WEB_ORIGIN` ให้ตรงกับ URL
2. ตั้ง Supabase Site URL และ Redirect URL ให้ตรงกับ URL

ไฟล์ `netlify.toml` จะตั้ง SPA fallback ให้อัตโนมัติ หลัง deploy ให้ทดสอบ refresh URL ย่อย เช่น `/incidents/new?loc=OPD-F1-REG` ต้องยังเปิดหน้าเว็บได้ ไม่เป็น 404

### 3.7 หากใช้ Server/Nginx ของตนเอง

สร้างไฟล์ Production:

```powershell
cd C:\Users\poplo\Desktop\ISRI\web
npm ci
npm run build
```

นำเนื้อหาใน `web/dist` ไปไว้ใน document root ของ Nginx และตั้ง SPA fallback:

```nginx
server {
    listen 443 ssl;
    server_name isri.example.com;

    root /var/www/isri/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

ต้องใช้ HTTPS ใน Production เพราะ OAuth และข้อมูลผู้ใช้งานไม่ควรส่งผ่าน HTTP คำสั่ง `npm run preview` มีไว้ตรวจ build ชั่วคราว ไม่ควรใช้เป็น Production server

## 4. เช็กลิสต์หลัง Deploy

- เปิดหน้าแรกและ refresh หน้า route ย่อยแล้วไม่ 404
- Google Login กลับมาที่ `/auth/callback` สำเร็จ
- `poplowplay1@gmail.com` เป็น Admin ทันที
- ผู้ใช้ใหม่คนอื่นเห็นหน้ารออนุมัติ
- Admin อนุมัติ Reporter หลายคนพร้อมกันได้
- Admin เข้า Dispatcher ไม่ได้
- Reporter เข้า Leaderboard ไม่ได้
- Reporter สแกน QR แล้วตำแหน่งถูกกรอกตรงกับ QR
- Dispatcher ยืนยัน urgency และมอบหมายงานได้
- Technician เปลี่ยนสถานะและแนบรูปได้
- Dispatcher ตรวจรับและปิดงานได้ แต้มเพิ่มครั้งเดียว
- แลกรางวัลแบบรับเองและจัดส่งได้
- Admin ส่งมอบหรือยกเลิกได้ ยอดแต้มและสต็อกตรงกัน
- Dashboard และ `/dashboard/reporting-counts?month=YYYY-MM` โหลดได้
- Notification Realtime มาโดยไม่ต้อง refresh; หาก Realtime หลุด การเปิดหน้าใหม่ยังโหลดข้อมูลผ่าน API ได้
- ไม่มี `service_role`, Secret Key หรือ Google Client Secret อยู่ใน browser bundle/repository

## 5. การอัปเดตระบบครั้งถัดไป

Backend:

```powershell
cd C:\Users\poplo\Desktop\ISRI\api
npx supabase db reset
.\.tools\deno.exe task check
.\.tools\deno.exe task test
npx supabase db push --dry-run
npx supabase db push
npx supabase functions deploy isri-api --project-ref nzwtybjijnreeylbmjlp
```

Frontend:

```powershell
cd C:\Users\poplo\Desktop\ISRI\web
npm ci
npm run lint
npm run build
```

เมื่อ push branch Production แล้วให้ hosting build ใหม่ และทำ smoke test ตามเช็กลิสต์ทุกครั้ง

## 6. เอกสารอ้างอิงทางการ

- [Supabase: Local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase: Seeding your database](https://supabase.com/docs/guides/local-development/seeding-your-database)
- [Supabase: Database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase: Deploy Edge Functions](https://supabase.com/docs/guides/functions/deploy)
- [Supabase: Edge Function secrets](https://supabase.com/docs/guides/functions/secrets)
- [Vite: Deploying a static site](https://vite.dev/guide/static-deploy.html)
- [Netlify: Vite deployment](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
