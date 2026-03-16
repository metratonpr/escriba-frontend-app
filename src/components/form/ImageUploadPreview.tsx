import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import ProtectedImage from "../Layout/ProtectedImage";

export type ImageUploadPreviewProps = {
  file?: File | null;
  existingImageUrl?: string | null;
  onFileChange: (file: File | null) => void;
  onRemove?: () => void;
  accept?: string;
  buttonLabel: string;
  removeButtonLabel?: string;
  removeButtonDisabled?: boolean;
  helperText?: ReactNode;
  details?: ReactNode;
  placeholder?: ReactNode;
  previewAlt?: string;
  previewWrapperClassName?: string;
  imageClassName?: string;
  overlayText?: string;
  error?: string;
  onRemoteReady?: () => void;
  onRemoteError?: () => void;
};

const DEFAULT_WRAPPER_CLASS =
  "relative flex aspect-square w-full max-w-[240px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 sm:mx-0 mx-auto";
const DEFAULT_IMAGE_CLASS = "h-full w-full object-contain";
const DEFAULT_OVERLAY_TEXT = "Carregando imagem...";
const DEFAULT_PLACEHOLDER = (
  <div className="px-6 text-center text-sm text-gray-500 dark:text-gray-300">
    Nenhuma imagem selecionada
  </div>
);
const DEFAULT_HELPER_TEXT = "JPG, JPEG, PNG ou WEBP ate 5MB.";
const DEFAULT_REMOVE_LABEL = "Remover imagem";

export default function ImageUploadPreview(props: ImageUploadPreviewProps) {
  const {
    file,
    existingImageUrl,
    onFileChange,
    onRemove,
    accept = "image/*",
    buttonLabel,
    removeButtonLabel,
    removeButtonDisabled,
    helperText = DEFAULT_HELPER_TEXT,
    details,
    placeholder,
    previewAlt = "Imagem",
    previewWrapperClassName,
    imageClassName,
    overlayText = DEFAULT_OVERLAY_TEXT,
    error,
    onRemoteError,
    onRemoteReady,
  } = props;

  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isRemoteLoading, setIsRemoteLoading] = useState(false);
  const [hasRemoteError, setHasRemoteError] = useState(false);

  useEffect(() => {
    if (!file) {
      setLocalPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (file || !existingImageUrl) {
      setHasRemoteError(false);
      setIsRemoteLoading(false);
      return;
    }

    setHasRemoteError(false);
    setIsRemoteLoading(true);
  }, [existingImageUrl, file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    event.target.value = "";
    onFileChange(nextFile);
  };

  const handleRemoteReady = () => {
    setIsRemoteLoading(false);
    setHasRemoteError(false);
    onRemoteReady?.();
  };

  const handleRemoteError = () => {
    setIsRemoteLoading(false);
    setHasRemoteError(true);
    onRemoteError?.();
  };

  const shouldShowRemote =
    !localPreviewUrl && Boolean(existingImageUrl) && !hasRemoteError;
  const placeholderContent = placeholder ?? DEFAULT_PLACEHOLDER;

  return (
    <div className="space-y-3">
      <div className={previewWrapperClassName ?? DEFAULT_WRAPPER_CLASS}>
        {localPreviewUrl ? (
          <img
            src={localPreviewUrl}
            alt={previewAlt}
            className={imageClassName ?? DEFAULT_IMAGE_CLASS}
          />
        ) : shouldShowRemote ? (
          <ProtectedImage
            src={existingImageUrl ?? ""}
            alt={previewAlt}
            className={imageClassName ?? DEFAULT_IMAGE_CLASS}
            onFetchError={handleRemoteError}
            onReady={handleRemoteReady}
          />
        ) : (
          placeholderContent
        )}

        {isRemoteLoading && overlayText && shouldShowRemote && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-gray-500 dark:bg-gray-900/60 dark:text-gray-300">
            {overlayText}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {buttonLabel}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <button
          type="button"
          onClick={onRemove}
          disabled={onRemove == null || removeButtonDisabled}
          className="inline-flex items-center rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {removeButtonLabel ?? DEFAULT_REMOVE_LABEL}
        </button>
      </div>

      {helperText ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
      <div className="space-y-1">
        {details}
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
