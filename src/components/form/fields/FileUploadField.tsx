import {
  AddPhotoAlternateOutlined,
  AttachFileOutlined,
  CloseOutlined,
  ImageOutlined,
  InsertDriveFileOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";

const DEFAULT_IMAGE_ACCEPT: Accept = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  files?: File[];
  maxFiles?: number;
  maxSize?: number;
  accept?: Accept;
  acceptedFileTypesLabel?: string;
  variant?: "dropzone" | "button";
  showImagePreviews?: boolean;
  onChange: (files: File[]) => void;
  errorMessage?: string;
}

const formatMegabytes = (bytes: number) => {
  const value = bytes / 1024 / 1024;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const getAcceptedFileTypesLabel = (accept?: Accept) => {
  if (!accept) return "ทุกประเภทไฟล์";
  const extensions = Object.values(accept).flat();
  const labels =
    extensions.length > 0
      ? extensions.map((extension) =>
          extension.replace(/^\./, "").toUpperCase(),
        )
      : Object.keys(accept);
  if (labels.length < 2) return labels[0] ?? "ไฟล์ที่กำหนด";
  return `${labels.slice(0, -1).join(", ")} และ ${labels.at(-1)}`;
};

function FilePreview({
  file,
  showImagePreview,
  onRemove,
}: {
  file: File;
  showImagePreview: boolean;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!showImagePreview || !file.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, showImagePreview]);

  return (
    <Box
      sx={{
        position: "relative",
        width: showImagePreview ? 144 : "100%",
        height: "auto",
        minHeight: 44,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        borderRadius: 1.5,
        bgcolor: "#F7F7FA",
        display: "flex",
        alignItems: "center",
        pr: showImagePreview ? 0 : 5,
      }}
    >
      {previewUrl ? (
        <Box
          component="img"
          src={previewUrl}
          alt={file.name}
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      ) : (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", px: 1.5, minWidth: 0 }}
        >
          <InsertDriveFileOutlined color="action" fontSize="small" />
          <Typography variant="body2" noWrap title={file.name}>
            {file.name}
          </Typography>
        </Stack>
      )}
      <IconButton
        aria-label={`ลบ ${file.name}`}
        onClick={onRemove}
        size="small"
        sx={{
          position: "absolute",
          top: showImagePreview ? 4 : "50%",
          right: 4,
          transform: showImagePreview ? undefined : "translateY(-50%)",
          bgcolor: "rgba(255,255,255,.9)",
          "&:hover": { bgcolor: "common.white" },
        }}
      >
        <CloseOutlined fontSize="small" />
      </IconButton>
    </Box>
  );
}

export function FileUploadField({
  label,
  required,
  files = [],
  maxFiles = 3,
  maxSize = 3 * 1024 * 1024,
  accept = DEFAULT_IMAGE_ACCEPT,
  acceptedFileTypesLabel,
  variant = "dropzone",
  showImagePreviews = true,
  onChange,
  errorMessage,
}: FileUploadFieldProps) {
  const [uploadMessage, setUploadMessage] = useState<string>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const fileTypesLabel =
    acceptedFileTypesLabel ?? getAcceptedFileTypesLabel(accept);
  const maxSizeLabel = formatMegabytes(maxSize);
  const acceptedMimeTypes = Object.keys(accept);
  const acceptsOnlyImages =
    acceptedMimeTypes.length > 0 &&
    acceptedMimeTypes.every((mimeType) => mimeType.startsWith("image/"));
  const itemNoun = acceptsOnlyImages ? "ภาพ" : "ไฟล์";

  const showUploadError = (message: string) => {
    setUploadMessage(message);
    setSnackbarOpen(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    multiple: maxFiles > 1,
    maxSize,
    onDropAccepted: (acceptedFiles) => {
      const nextFiles =
        maxFiles === 1
          ? acceptedFiles.slice(0, 1)
          : [...files, ...acceptedFiles].slice(0, maxFiles);
      if (maxFiles > 1 && files.length + acceptedFiles.length > maxFiles) {
        showUploadError(`แนบไฟล์ได้ไม่เกิน ${maxFiles} ไฟล์`);
      } else {
        setUploadMessage(undefined);
        setSnackbarOpen(false);
      }
      onChange(nextFiles);
    },
    onDropRejected: (rejections) => {
      const codes = rejections.flatMap((rejection) =>
        rejection.errors.map((error) => error.code),
      );
      showUploadError(
        codes.includes("file-too-large")
          ? `ขนาดไฟล์ต้องไม่เกิน ${maxSizeLabel} MB ต่อไฟล์`
          : codes.includes("too-many-files")
            ? `แนบไฟล์ได้ไม่เกิน ${maxFiles} ไฟล์`
            : `รองรับไฟล์ ${fileTypesLabel} เท่านั้น`,
      );
    },
  });
  const message = errorMessage || uploadMessage;

  return (
    <Stack spacing={1.25}>
      <Box {...getRootProps()}>
        <input {...getInputProps()} />
        {variant === "button" ? (
          <Button
            component="span"
            variant="outlined"
            startIcon={<AttachFileOutlined />}
          >
            {label}
          </Button>
        ) : (
          <Box
            sx={{
              minHeight: 148,
              px: 2,
              py: 3,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              border: "1px dashed",
              borderRadius: 1.5,
              borderColor: message
                ? "error.main"
                : isDragActive
                  ? "primary.main"
                  : "divider",
              bgcolor: isDragActive ? "rgba(75,59,134,.05)" : "#FCFBFE",
              cursor: "pointer",
              transition: "all .15s ease",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(75,59,134,.04)",
              },
            }}
          >
            <Stack spacing={0.5} sx={{ alignItems: "center" }}>
              <AddPhotoAlternateOutlined
                color="primary"
                sx={{ fontSize: 32 }}
              />
              <Typography variant="h6">
                {label}
                {required && (
                  <Box component="span" color="error.main">
                    {" "}
                    *
                  </Box>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ลาก{itemNoun}มาวางที่นี่ หรือกดเพื่อเลือกไฟล์
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fileTypesLabel.replace(" และ ", ", ")} · ไม่เกิน {maxSizeLabel}{" "}
                MB ต่อ{itemNoun} · สูงสุด {maxFiles} {itemNoun}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>
      {message && (
        <Typography variant="body2" color="error.main">
          {message}
        </Typography>
      )}
      {variant === "button" && files.length > 0 && (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          แนบแล้ว {files.length} {itemNoun}
        </Typography>
      )}
      {files.length > 0 && (
        <Stack
          direction={showImagePreviews ? "row" : "column"}
          spacing={1.25}
          sx={{ flexWrap: "wrap", rowGap: 1.25 }}
        >
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${file.lastModified}`}
              file={file}
              showImagePreview={showImagePreviews}
              onRemove={() =>
                onChange(files.filter((_, fileIndex) => fileIndex !== index))
              }
            />
          ))}
        </Stack>
      )}
      {variant === "dropzone" && files.length > 0 && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          {acceptsOnlyImages ? (
            <ImageOutlined fontSize="small" color="action" />
          ) : (
            <InsertDriveFileOutlined fontSize="small" color="action" />
          )}
          <Typography variant="body2" color="text.secondary">
            แนบแล้ว {files.length} {itemNoun}
          </Typography>
        </Stack>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") {
            setSnackbarOpen(false);
            setUploadMessage(undefined);
          }
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => {
            setSnackbarOpen(false);
            setUploadMessage(undefined);
          }}
          sx={{ width: "100%" }}
        >
          {uploadMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
