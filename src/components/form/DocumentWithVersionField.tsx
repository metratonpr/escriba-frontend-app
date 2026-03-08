import { useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import { getDocuments } from "../../services/documentService";
import type { FieldErrorValue } from "../../utils/errorUtils";

interface Option {
  id: number | string;
  label: string;
}

interface DocumentWithVersionFieldProps {
  document: Option | null;
  onDocumentChange: (doc: Option | null) => void;
  versionId?: string;
  onVersionChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  documentError?: FieldErrorValue;
  versionError?: FieldErrorValue;
}

export default function DocumentWithVersionField({
  document,
  onDocumentChange,
  className = "",
  documentError,
}: DocumentWithVersionFieldProps) {
  const [documentOptions, setDocumentOptions] = useState<Option[]>([]);

  useEffect(() => {
    let mounted = true;

    getDocuments({ page: 1, perPage: 100 })
      .then((res) => {
        if (!mounted) {
          return;
        }

        const docs = Array.isArray(res) ? res : res.data;
        setDocumentOptions(
          docs.map((d: any) => ({
            id: d.id,
            label: `${d.code} - ${d.name}`,
          }))
        );
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setDocumentOptions([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <FormAutocompleteField
        label="Documento"
        value={document}
        onChange={onDocumentChange}
        options={documentOptions}
        error={documentError}
      />
    </div>
  );
}
