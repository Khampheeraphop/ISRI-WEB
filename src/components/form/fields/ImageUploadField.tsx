import { AddPhotoAlternateOutlined, CloseOutlined, ImageOutlined } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const imageAccept = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] };

function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => { const url = URL.createObjectURL(file); setPreviewUrl(url); return () => URL.revokeObjectURL(url); }, [file]);
  return <Box sx={{ position: "relative", width: 112, height: 112, borderRadius: 1.5, overflow: "hidden", border: 1, borderColor: "divider" }}><Box component="img" src={previewUrl} alt={file.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} /><IconButton aria-label={`ลบ ${file.name}`} onClick={onRemove} size="small" sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(255,255,255,.9)", "&:hover": { bgcolor: "common.white" } }}><CloseOutlined fontSize="small" /></IconButton></Box>;
}

interface ImageUploadFieldProps { label: string; required?: boolean; files?: File[]; onChange: (files: File[]) => void; errorMessage?: string; }

export function ImageUploadField({ label, required, files = [], onChange, errorMessage }: ImageUploadFieldProps) {
  const [uploadMessage, setUploadMessage] = useState<string>();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept: imageAccept, maxFiles: 3, maxSize: 3 * 1024 * 1024, onDropAccepted: (acceptedFiles) => { setUploadMessage(undefined); onChange([...files, ...acceptedFiles].slice(0, 3)); }, onDropRejected: (rejections) => { const code = rejections[0]?.errors[0]?.code; setUploadMessage(code === "file-too-large" ? "ขนาดไฟล์ต้องไม่เกิน 3 MB" : code === "too-many-files" ? "แนบภาพได้ไม่เกิน 3 ภาพ" : "รองรับไฟล์ JPG, JPEG และ PNG เท่านั้น"); } });
  const message = errorMessage || uploadMessage;
  return <Stack spacing={1.25}><Box {...getRootProps()} sx={{ minHeight: 148, px: 2, py: 3, display: "grid", placeItems: "center", textAlign: "center", border: "1px dashed", borderRadius: 1.5, borderColor: message ? "error.main" : isDragActive ? "primary.main" : "divider", bgcolor: isDragActive ? "rgba(75,59,134,.05)" : "#FCFBFE", cursor: "pointer", transition: "all .15s ease", "&:hover": { borderColor: "primary.main", bgcolor: "rgba(75,59,134,.04)" } }}><input {...getInputProps()} /><Stack spacing={0.5} sx={{ alignItems: "center" }}><AddPhotoAlternateOutlined color="primary" sx={{ fontSize: 32 }} /><Typography variant="h6">{label}{required && <Box component="span" color="error.main"> *</Box>}</Typography><Typography variant="body2" color="text.secondary">ลากภาพมาวางที่นี่ หรือกดเพื่อเลือกไฟล์</Typography><Typography variant="body2" color="text.secondary">JPG, JPEG, PNG · ไม่เกิน 3 MB ต่อภาพ · สูงสุด 3 ภาพ</Typography></Stack></Box>{message && <Typography variant="body2" color="error.main">{message}</Typography>}{files.length > 0 && <Stack direction="row" spacing={1.25} sx={{ flexWrap: "wrap", rowGap: 1.25 }}>{files.map((file, index) => <ImagePreview key={`${file.name}-${file.lastModified}`} file={file} onRemove={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))} />)}</Stack>}{files.length > 0 && <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}><ImageOutlined fontSize="small" color="action" /><Typography variant="body2" color="text.secondary">แนบแล้ว {files.length} ภาพ</Typography></Stack>}</Stack>;
}
