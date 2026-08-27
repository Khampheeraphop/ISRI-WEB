import { Box, CircularProgress, Typography } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type DataGridProps,
  type GridValidRowModel,
} from "@mui/x-data-grid";

interface GenericDataTableProps<T extends GridValidRowModel> extends Omit<
  DataGridProps<T>,
  | "rows"
  | "columns"
  | "loading"
  | "autoHeight"
  | "hideFooter"
  | "pagination"
  | "pageSizeOptions"
  | "initialState"
> {
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  showPagination?: boolean;
  pageSizeOptions?: number[];
}

export function GenericDataTable<T extends GridValidRowModel>({
  rows,
  columns,
  loading = false,
  emptyMessage = "ยังไม่มีข้อมูล",
  showPagination = false,
  pageSizeOptions = [10, 25, 50],
  ...dataGridProps
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
      hideFooter={!showPagination}
      pagination={showPagination ? true : undefined}
      pageSizeOptions={pageSizeOptions}
      initialState={
        showPagination
          ? { pagination: { paginationModel: { page: 0, pageSize: pageSizeOptions[0] ?? 10 } } }
          : undefined
      }
      rowHeight={56}
      columnHeaderHeight={52}
      {...dataGridProps}
      sx={{
        border: 0,
        fontSize: "0.95rem",
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#F4F1FA",
          fontSize: "0.95rem",
          fontWeight: 600,
        },
        "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
          alignItems: "center",
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: 600,
          lineHeight: 1.25,
          whiteSpace: "normal",
        },
        "& .MuiDataGrid-cell": { fontSize: "0.95rem" },
        "& .MuiDataGrid-cell[data-field='actions']": {
          justifyContent: "center",
        },
        "& .MuiDataGrid-cell[data-field='actions'] .MuiStack-root": {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          whiteSpace: "nowrap",
        },
      }}
    />
  );
}
