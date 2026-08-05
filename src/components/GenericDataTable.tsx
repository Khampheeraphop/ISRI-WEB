import { Box, CircularProgress, Typography } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridValidRowModel,
} from "@mui/x-data-grid";

interface GenericDataTableProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export function GenericDataTable<T extends GridValidRowModel>({
  rows,
  columns,
  loading = false,
  emptyMessage = "ยังไม่มีข้อมูล",
}: GenericDataTableProps<T>) {
  if (loading)
    return (
      <Box sx={{ display: "grid", minHeight: 220, placeItems: "center" }}>
        <CircularProgress size={28} />
      </Box>
    );
  if (!rows.length)
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      disableRowSelectionOnClick
      autoHeight
      hideFooter
      sx={{
        border: 0,
        fontSize: "0.95rem",
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#F4F1FA",
          fontSize: "0.95rem",
          fontWeight: 600,
        },
        "& .MuiDataGrid-cell": { fontSize: "0.95rem" },
      }}
    />
  );
}
