import { EmojiEventsOutlined, MilitaryTechOutlined } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import {
  campaignPeriodLabel,
  campaignStatusLabel,
  formatCampaignPeriod,
} from "./campaign.constants";
import { getCampaignLeaderboard, getCampaigns } from "./campaignApi";

type LeaderboardRow = {
  id: string;
  rank: number;
  name: string;
  points: number;
  lastScoredAt?: string;
};

const getInitials = (name: string) =>
  name
    .replace(/^(คุณ|นาย|นางสาว|นาง)\s*/u, "")
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

function PodiumWinner({ row }: { row: LeaderboardRow }) {
  const isLeader = row.rank === 1;
  return (
    <Stack
      spacing={0.9}
      sx={{
        alignItems: "center",
        justifyContent: "flex-end",
        minWidth: 0,
      }}
    >
      <Box sx={{ position: "relative", pt: isLeader ? 3 : 0 }}>
        {isLeader && (
          <EmojiEventsOutlined
            color="primary"
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 28,
            }}
          />
        )}
        <Avatar
          sx={{
            width: isLeader ? 88 : 68,
            height: isLeader ? 88 : 68,
            bgcolor: isLeader ? "primary.main" : "primary.light",
            color: "primary.contrastText",
            fontSize: isLeader ? 27 : 20,
            fontWeight: 700,
            border: 3,
            borderColor: "background.paper",
            outline: 1,
            outlineColor: isLeader ? "primary.main" : "divider",
          }}
        >
          {getInitials(row.name)}
        </Avatar>
        <Box
          sx={{
            position: "absolute",
            right: -5,
            bottom: -5,
            minWidth: 26,
            height: 26,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: isLeader ? "primary.main" : "background.paper",
            color: isLeader ? "primary.contrastText" : "text.primary",
            border: 1,
            borderColor: isLeader ? "primary.main" : "divider",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {row.rank}
        </Box>
      </Box>
      <Box sx={{ textAlign: "center", minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700 }}>
          {row.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {row.points.toLocaleString("th-TH")} คะแนน
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          minHeight: isLeader ? 142 : 96,
          px: 1.5,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          bgcolor: isLeader ? "primary.main" : "background.default",
          color: isLeader ? "primary.contrastText" : "text.primary",
          border: 1,
          borderColor: isLeader ? "primary.main" : "divider",
          borderBottom: 0,
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Stack spacing={0.25} sx={{ alignItems: "center" }}>
          <Typography variant={isLeader ? "h4" : "h6"}>
            {row.rank === 1 ? "ผู้นำแคมเปญ" : `อันดับ ${row.rank}`}
          </Typography>
          <Typography variant="caption" sx={{ opacity: isLeader ? 0.85 : 1 }}>
            คะแนนสะสม {row.points.toLocaleString("th-TH")}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

export function CampaignLeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const campaigns = useQuery({ queryKey: ["campaigns"], queryFn: getCampaigns });
  const selectedId = searchParams.get("campaign");
  const selectedCampaign =
    (campaigns.data ?? []).find((item) => item.id === selectedId) ??
    (campaigns.data ?? []).find((item) => item.status === "active") ??
    campaigns.data?.[0];
  const leaderboard = useQuery({
    queryKey: ["campaign-leaderboard", selectedCampaign?.id],
    queryFn: () => getCampaignLeaderboard(selectedCampaign!.id),
    enabled: Boolean(selectedCampaign),
  });
  const rows = useMemo<LeaderboardRow[]>(() => {
    return (leaderboard.data?.scores ?? [])
      .map((score) => ({
        id: score.userId,
        name: score.name,
        points: score.points,
        lastScoredAt: score.lastScoredAt,
        rank: 0,
      }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          (a.lastScoredAt ?? "9999").localeCompare(b.lastScoredAt ?? "9999") ||
          a.name.localeCompare(b.name, "th"),
      )
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [leaderboard.data]);
  const leaders = rows.slice(0, 3);
  const followers = rows.slice(3);
  const maxPoints = leaders[0]?.points || 1;
  const desktopColumns =
    leaders.length === 1
      ? "minmax(250px, 340px)"
      : leaders.length === 2
        ? "repeat(3, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))";

  if (campaigns.isLoading || (selectedCampaign && leaderboard.isLoading))
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "flex-end" },
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box>
          <Typography variant="h3">อันดับแคมเปญ</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            อันดับตัดสินจากคะแนนสูงสุดของรอบ
            และใช้เวลาที่ถึงคะแนนนั้นก่อนเมื่อคะแนนเท่ากัน
          </Typography>
        </Box>
        <FormControl sx={{ width: { xs: "100%", sm: 440 } }}>
          <InputLabel id="campaign-select-label">เลือกแคมเปญ</InputLabel>
          <Select
            labelId="campaign-select-label"
            label="เลือกแคมเปญ"
            value={selectedCampaign?.id ?? ""}
            onChange={(event) =>
              setSearchParams({ campaign: event.target.value })
            }
          >
            {(campaigns.data ?? []).map((campaign) => (
              <MenuItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {!selectedCampaign ? (
        <MainCard title={<Typography variant="h5">ยังไม่มีแคมเปญ</Typography>}>
          <Typography color="text.secondary">
            ผู้ดูแลระบบสามารถสร้างแคมเปญใหม่เพื่อเริ่มสะสมคะแนนได้
          </Typography>
        </MainCard>
      ) : (
        <>
          <MainCard contentSx={{ p: { xs: 2.25, md: 2.75 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              sx={{
                alignItems: { md: "center" },
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="h5">{selectedCampaign.name}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                  {formatCampaignPeriod(
                    selectedCampaign.startDate,
                    selectedCampaign.endDate,
                  )}{" "}
                  · {campaignPeriodLabel[selectedCampaign.periodType]}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", flexWrap: "wrap" }}
              >
                <Chip
                  label={campaignStatusLabel[selectedCampaign.status]}
                  color={
                    selectedCampaign.status === "active" ? "success" : "default"
                  }
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  {selectedCampaign.prizeDescription}
                </Typography>
              </Stack>
            </Stack>
          </MainCard>

          <MainCard contentSx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack
              spacing={0.5}
              sx={{ alignItems: "center", textAlign: "center" }}
            >
              <MilitaryTechOutlined color="primary" />
              <Typography variant="h4">
                {selectedCampaign.status === "active"
                  ? "ผู้นำแคมเปญ"
                  : "ผลการจัดอันดับ"}
              </Typography>
              <Typography color="text.secondary">
                {selectedCampaign.status === "active"
                  ? "คะแนนจะอัปเดตเมื่อรายการแจ้งซ่อมดำเนินการเสร็จสิ้น"
                  : "ปิดรอบแล้ว อันดับและคะแนนถูกล็อกเรียบร้อย"}
              </Typography>
            </Stack>

            {!leaders.length ? (
              <Typography
                color="text.secondary"
                sx={{ mt: 3, textAlign: "center" }}
              >
                ยังไม่มีผู้เข้าร่วมแคมเปญ
              </Typography>
            ) : (
              <>
                <Box
                  sx={{
                    mt: { xs: 4, md: 5 },
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: desktopColumns },
                    justifyContent: "center",
                    gap: { xs: 3, md: 2 },
                    alignItems: "end",
                    maxWidth: leaders.length === 1 ? 340 : 980,
                    mx: "auto",
                  }}
                >
                  {leaders
                    .sort((a, b) =>
                      a.rank === 1 ? 1 : b.rank === 1 ? -1 : a.rank - b.rank,
                    )
                    .map((row) => (
                      <PodiumWinner key={row.id} row={row} />
                    ))}
                </Box>

                {!!followers.length && (
                  <Stack
                    spacing={1.25}
                    sx={{ mt: 4, maxWidth: 820, mx: "auto" }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      อันดับถัดไป
                    </Typography>
                    {followers.map((row) => (
                      <Stack
                        key={row.id}
                        direction="row"
                        spacing={1.25}
                        sx={{
                          alignItems: "center",
                          p: { xs: 1.5, sm: 2 },
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1.5,
                        }}
                      >
                        <Typography
                          sx={{
                            width: 24,
                            color: "text.secondary",
                            fontWeight: 700,
                          }}
                        >
                          {row.rank}
                        </Typography>
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: "primary.light",
                            fontSize: 14,
                          }}
                        >
                          {getInitials(row.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography noWrap>{row.name}</Typography>
                          <Box
                            sx={{
                              mt: 0.65,
                              height: 4,
                              borderRadius: 9,
                              bgcolor: "divider",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${Math.max(4, (row.points / maxPoints) * 100)}%`,
                                height: "100%",
                                borderRadius: 9,
                                bgcolor: "primary.main",
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography
                          color="primary.main"
                          sx={{ fontWeight: 700 }}
                        >
                          {row.points.toLocaleString("th-TH")}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </>
            )}
          </MainCard>
        </>
      )}
    </Stack>
  );
}
