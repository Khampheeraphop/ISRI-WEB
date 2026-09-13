import {
  LocalShippingOutlined,
  PhoneOutlined,
  RedeemOutlined,
  StorefrontOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ActionDialog } from "../../components/feedback/ActionDialog";
import {
  formatThaiPhoneNumber,
  isValidThaiMobileNumber,
  normalizeThaiPhoneNumber,
} from "../../utils/phone";
import type { Reward } from "./rewardsApi";
import type { RewardRedemptionInput } from "./rewardsApi";

export function RewardRedemptionDialog({
  reward,
  defaultRecipientName,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  reward?: Reward;
  defaultRecipientName: string;
  submitting: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (input: RewardRedemptionInput) => void;
}) {
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!reward) return;
    setMethod("pickup");
    setRecipientName(defaultRecipientName);
    setPhone("");
    setAddress("");
    setNote("");
  }, [reward, defaultRecipientName]);

  if (!reward) return null;
  const phoneIsValid = isValidThaiMobileNumber(phone);
  const valid =
    recipientName.trim().length >= 2 &&
    phoneIsValid &&
    (method === "pickup" || address.trim().length >= 10);

  return (
    <ActionDialog
      open
      maxWidth="sm"
      title="ยืนยันการแลกรางวัล"
      icon={<RedeemOutlined color="primary" />}
      onRequestClose={() => !submitting && onClose()}
      footer={
        <>
          <Button onClick={onClose} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            disabled={!valid || submitting}
            onClick={() =>
              onSubmit({
                rewardItemId: reward.id,
                fulfillmentMethod: method,
                recipientName: recipientName.trim(),
                phone: normalizeThaiPhoneNumber(phone),
                deliveryAddress:
                  method === "delivery" ? address.trim() : undefined,
                requesterNote: note.trim() || undefined,
              })
            }
          >
            {submitting
              ? "กำลังบันทึก"
              : `ใช้ ${reward.pointCost.toLocaleString("th-TH")} แต้ม`}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "76px minmax(0, 1fr)",
            gap: 1.5,
            p: 1.25,
            overflow: "hidden",
            border: "1px solid #DED6EA",
            borderRadius: 2,
            bgcolor: "#F8F6FB",
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              borderRadius: 1.5,
              bgcolor: "#EEEAF5",
            }}
          >
            {reward.imageUrl ? (
              <Box
                component="img"
                src={reward.imageUrl}
                alt={reward.name}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <RedeemOutlined color="disabled" />
            )}
          </Box>
          <Box sx={{ minWidth: 0, alignSelf: "center" }}>
            <Typography sx={{ fontWeight: 700, lineHeight: 1.35 }}>
              {reward.name}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 0.25, fontSize: ".78rem" }}
              noWrap
            >
              {reward.description}
            </Typography>
            <Chip
              size="small"
              color="primary"
              label={`${reward.pointCost.toLocaleString("th-TH")} แต้ม`}
              sx={{ mt: 0.75, fontWeight: 700 }}
            />
          </Box>
        </Box>
        {Boolean(error) && (
          <Alert severity="error">
            {error instanceof Error ? error.message : "ไม่สามารถแลกรางวัลได้"}
          </Alert>
        )}
        <FormControl>
          <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700 }}>
            วิธีรับรางวัล
          </Typography>
          <RadioGroup
            value={method}
            onChange={(event) =>
              setMethod(event.target.value as "pickup" | "delivery")
            }
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1,
            }}
          >
            <FormControlLabel
              value="pickup"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <StorefrontOutlined fontSize="small" />
                  <Typography sx={{ fontSize: ".86rem", fontWeight: 600 }}>
                    รับด้วยตนเอง
                  </Typography>
                </Stack>
              }
              sx={{
                m: 0,
                px: 1,
                py: 0.5,
                border: method === "pickup" ? 2 : 1,
                borderColor: method === "pickup" ? "primary.main" : "divider",
                borderRadius: 1.75,
                bgcolor: method === "pickup" ? "rgba(81,64,145,.055)" : "transparent",
              }}
            />
            <FormControlLabel
              value="delivery"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <LocalShippingOutlined fontSize="small" />
                  <Typography sx={{ fontSize: ".86rem", fontWeight: 600 }}>
                    จัดส่ง
                  </Typography>
                </Stack>
              }
              sx={{
                m: 0,
                px: 1,
                py: 0.5,
                border: method === "delivery" ? 2 : 1,
                borderColor: method === "delivery" ? "primary.main" : "divider",
                borderRadius: 1.75,
                bgcolor: method === "delivery" ? "rgba(81,64,145,.055)" : "transparent",
              }}
            />
          </RadioGroup>
        </FormControl>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 1.5,
          }}
        >
        <TextField
          required
          label="ชื่อผู้รับ"
          value={recipientName}
          onChange={(event) => setRecipientName(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 160 } }}
        />
        <TextField
          required
          label="เบอร์โทรศัพท์ติดต่อ"
          value={phone}
          onChange={(event) => setPhone(formatThaiPhoneNumber(event.target.value))}
          error={Boolean(phone) && !phoneIsValid}
          helperText={
            phone && !phoneIsValid
              ? "กรุณากรอกเบอร์มือถือไทย 10 หลัก"
              : "ตัวอย่าง 081-234-5678"
          }
          slotProps={{
            input: {
              startAdornment: <PhoneOutlined color="action" sx={{ mr: 1, fontSize: 20 }} />,
            },
            htmlInput: {
              maxLength: 12,
              inputMode: "numeric",
              autoComplete: "tel",
            },
          }}
        />
        </Box>
        {method === "delivery" && (
          <TextField
            required
            label="ที่อยู่สำหรับจัดส่ง"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            multiline
            minRows={3}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
          />
        )}
        <TextField
          label="หมายเหตุถึงผู้ดูแล (ถ้ามี)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          multiline
          minRows={2}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      </Stack>
    </ActionDialog>
  );
}
