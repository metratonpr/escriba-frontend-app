import { useEffect, useRef, useState } from "react";
import fileService from "../../services/FileService";

type OmittedImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">;

export interface ProtectedImageProps extends OmittedImgProps {
  src?: string | null;
  fallbackSrc?: string;
  onFetchError?: () => void;
  onReady?: (status: "success" | "error") => void;
}

const DEFAULT_FALLBACK = "/images/placeholderfoto.jpg";

export default function ProtectedImage(props: ProtectedImageProps) {
  const {
    src,
    fallbackSrc = DEFAULT_FALLBACK,
    onFetchError,
    onReady,
    alt = "",
    ...imgProps
  } = props;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const onFetchErrorRef = useRef(onFetchError);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onFetchErrorRef.current = onFetchError;
  }, [onFetchError]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (!src) {
      setBlobUrl(null);
      return;
    }

    let isActive = true;
    let currentBlobUrl: string | null = null;

    setBlobUrl(null);

    void fileService
      .getFilePreviewData(undefined, src)
      .then(({ url }) => {
        if (!isActive) {
          fileService.revokeFileUrl(url);
          return;
        }

        currentBlobUrl = url;
        setBlobUrl(url);
        onReadyRef.current?.("success");
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setBlobUrl(null);
        onFetchErrorRef.current?.();
        onReadyRef.current?.("error");
      });

    return () => {
      isActive = false;
      if (currentBlobUrl) {
        fileService.revokeFileUrl(currentBlobUrl);
      }
    };
  }, [src]);

  return <img src={blobUrl ?? fallbackSrc} alt={alt} {...imgProps} />;
}
