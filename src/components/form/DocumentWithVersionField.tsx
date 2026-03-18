import { useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import FormSelectField from "./FormSelectField";
import { getDocumentsWithVersions } from "../../services/documentService";
import type { FieldErrorValue } from "../../utils/errorUtils";
import { mergeSelectedOption, type AutocompleteOption } from "../../utils/autocompleteUtils";
import {
  mapDocumentsWithVersionsToOptions,
  type DocumentWithVersionOption,
} from "../../utils/documentWithVersionUtils";

type Option = AutocompleteOption;

interface DocumentWithVersionFieldProps {
  document: Option | null;
  onDocumentChange: (doc: Option | null) => void;
  versionId?: string | number;
  onVersionChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onInputChange?: (value: string) => void;
  documentRequired?: boolean;
  versionRequired?: boolean;
  className?: string;
  documentError?: FieldErrorValue;
  versionError?: FieldErrorValue;
  initialOptions?: DocumentWithVersionOption[];
}

export default function DocumentWithVersionField({
  document,
  onDocumentChange,
  versionId = "",
  onVersionChange,
  onInputChange,
  documentRequired = false,
  versionRequired,
  className = "",
  documentError,
  versionError,
  initialOptions,
}: DocumentWithVersionFieldProps) {
  const [documentOptions, setDocumentOptions] = useState<DocumentWithVersionOption[]>(() =>
    mergeSelectedOption(initialOptions ?? [], document)
  );

  useEffect(() => {
    if (!initialOptions) {
      return;
    }

    setDocumentOptions(mergeSelectedOption(initialOptions, document));
  }, [document, initialOptions]);

  useEffect(() => {
    if (initialOptions) {
      return;
    }

    let mounted = true;

    getDocumentsWithVersions({ page: 1, perPage: 100 })
      .then((res) => {
        if (!mounted) {
          return;
        }

        setDocumentOptions(mapDocumentsWithVersionsToOptions(res.data));
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
  }, [initialOptions]);

  useEffect(() => {
    setDocumentOptions((prev) => mergeSelectedOption(prev, document));
  }, [document]);

  const selectedDocumentOption =
    documentOptions.find((option) => String(option.id) === String(document?.id ?? "")) ?? null;
  const availableVersions = selectedDocumentOption?.versions ?? [];

  return (
    <div className={`space-y-4 ${className}`}>
      <FormAutocompleteField
        label="Documento"
        name="document_id"
        value={document}
        onChange={onDocumentChange}
        options={documentOptions}
        error={documentError}
        onInputChange={onInputChange}
        required={documentRequired}
      />

      {onVersionChange ? (
        <FormSelectField
          name="document_version_id"
          label="Versao"
          value={versionId}
          onChange={onVersionChange}
          options={availableVersions.map((version) => ({
            value: version.id,
            label: version.label,
          }))}
          placeholder={
            document?.id ? "Selecione a versao..." : "Selecione um documento primeiro"
          }
          error={versionError}
          disabled={!document?.id || availableVersions.length === 0}
          required={versionRequired ?? availableVersions.length > 0}
        />
      ) : null}
    </div>
  );
}
