import { FileUploadField, type FileUploadFieldProps } from "./FileUploadField";

type ImageUploadFieldProps = Omit<
  FileUploadFieldProps,
  "accept" | "acceptedFileTypesLabel" | "showImagePreviews"
> &
  Partial<
    Pick<
      FileUploadFieldProps,
      "accept" | "acceptedFileTypesLabel" | "showImagePreviews"
    >
  >;

export function ImageUploadField(props: ImageUploadFieldProps) {
  return (
    <FileUploadField
      showImagePreviews
      {...props}
    />
  );
}
