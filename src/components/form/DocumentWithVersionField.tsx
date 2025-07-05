import React, { useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import FormSelectField from "./FormSelectField";
import { getDocuments } from "../../services/documentService";


interface Option {
  id: number | string;
  label: string;
}

interface Version {
  id: number;
  version: string;
}

interface DocumentWithVersionFieldProps {
  document: Option | null;
  onDocumentChange: (doc: Option | null) => void;
  versionId: string;
  onVersionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export default function DocumentWithVersionField({
  document,
  onDocumentChange,
  versionId,
  onVersionChange,
  className = "",
}: DocumentWithVersionFieldProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentOptions, setDocumentOptions] = useState<Option[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    getDocuments({ page: 1, perPage: 100 }).then((res) => {
      const docs = Array.isArray(res) ? res : res.data;
      setDocuments(docs);
      setDocumentOptions(
        docs.map((d: any) => ({
          id: d.id,
          label: `${d.code} - ${d.name}`,
        }))
      );
    });
  }, []);

  useEffect(() => {
    if (document) {
      const selected = documents.find((d) => d.id === document.id);
      const versions = selected?.versions ?? [];
      setVersions(versions.map((v: any) => ({ id: v.id, version: v.version })));
    } else {
      setVersions([]);
    }
  }, [document, documents]);

  return (
    <div className={`space-y-4 ${className}`}>
      <FormAutocompleteField
        label="Documento"
        value={document}
        onChange={onDocumentChange}
        options={documentOptions}
      />
      {versions.length > 0 && (
        <FormSelectField
          label="Versão do Documento"
          name="version_id"
          value={versionId}
          onChange={onVersionChange}
          options={versions.map((v) => ({ value: v.id, label: v.version }))}
        />
      )}
    </div>
  );
}
