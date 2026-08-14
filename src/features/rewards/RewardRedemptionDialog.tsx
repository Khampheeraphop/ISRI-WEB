import {
  Alert,
  Button,
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
  const valid =
    recipientName.trim().length >= 2 &&
    phone.trim().length >= 1 &&
    (method === "pickup" || address.trim().length >= 10);

  return (
    <ActionDialog
      open
      maxWidth="sm"
      title="ยืนยันการแลกรางวัล"
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
                phone: phone.trim(),
                deliveryAddress:
                  method === "delivery" ? address.trim() : undefined,
                requesterNote: note.trim() || undefined,
              })
            }
          >
            {submitting ? "กำลังบันทึก" : `ใช้ ${reward.pointCost} แต้ม`}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography>
          {reward.name} · {reward.pointCost.toLocaleString("th-TH")} แต้ม
        </Typography>
        {Boolean(error) && (
          <Alert severity="error">
            {error instanceof Error ? error.message : "ไม่สามารถแลกรางวัลได้"}
          </Alert>
        )}
        <FormControl>
          <Typography variant="subtitle2">วิธีรับรางวัล</Typography>
          <RadioGroup
            row
            value={method}
            onChange={(event) =>
              setMethod(event.target.value as "pickup" | "delivery")
            }
          >
            <FormControlLabel
              value="pickup"
              control={<Radio />}
              label="รับด้วยตนเอง"
            />
            <FormControlLabel
              value="delivery"
              control={<Radio />}
              label="จัดส่ง"
            />
          </RadioGroup>
        </FormControl>
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
          onChange={(event) => setPhone(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 30 } }}
        />
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
