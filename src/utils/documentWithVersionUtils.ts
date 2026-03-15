import type { DocumentWithVersionsResponse } from "../services/documentService";
import type { AutocompleteOption } from "./autocompleteUtils";

type LabelValue = string | number | null | undefined;

type DocumentLike = {
  id?: string | number | null;
  code?: LabelValue;
  name?: LabelValue;
};

type VersionLike = {
  id?: string | number | null;
  code?: LabelValue;
  version?: LabelValue;
};

export type DocumentVersionOption = AutocompleteOption;

export type DocumentWithVersionOption = AutocompleteOption & {
  versions: DocumentVersionOption[];
  selectedVersionId?: string | number | null;
};

function toLabelPart(value: LabelValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function formatDocumentLabel(document: Pick<DocumentLike, "code" | "name">): string {
  const parts = [toLabelPart(document.code), toLabelPart(document.name)].filter(Boolean);
  return parts.join(" - ");
}

export function formatDocumentVersionLabel(
  version: Pick<VersionLike, "code" | "version">
): string {
  const parts = [toLabelPart(version.code), toLabelPart(version.version)].filter(Boolean);
  return parts.join(" - ");
}

export function mapDocumentsWithVersionsToOptions(
  documents: DocumentWithVersionsResponse[],
  searchQuery = ""
): DocumentWithVersionOption[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return documents.map((document) => {
    const versions = (document.versions ?? []).map((version) => ({
      id: version.id,
      label: formatDocumentVersionLabel(version) || String(version.id),
    }));
    const matchedVersions = normalizedQuery
      ? versions.filter((version) => version.label.toLowerCase().includes(normalizedQuery))
      : [];
    const selectedVersion = normalizedQuery
      ? matchedVersions.length === 1
        ? matchedVersions[0]
        : versions.length === 1
          ? versions[0]
          : null
      : null;
    const baseLabel = formatDocumentLabel(document) || String(document.id);

    return {
      id: document.id,
      label: baseLabel,
      versions,
      selectedVersionId: selectedVersion?.id ?? null,
    };
  });
}

export function buildDocumentOption(
  document: DocumentLike | null | undefined
): AutocompleteOption | null {
  if (!document?.id) {
    return null;
  }

  return {
    id: document.id,
    label: formatDocumentLabel(document) || String(document.id),
  };
}

export function buildVersionOption(
  version: VersionLike | null | undefined
): DocumentVersionOption | null {
  if (!version?.id) {
    return null;
  }

  return {
    id: version.id,
    label: formatDocumentVersionLabel(version) || String(version.id),
  };
}

export function findDocumentOptionByVersionId(
  options: DocumentWithVersionOption[],
  versionId?: string | number | null
): DocumentWithVersionOption | null {
  if (!versionId) {
    return null;
  }

  return (
    options.find((option) =>
      option.versions.some((version) => String(version.id) === String(versionId))
    ) ?? null
  );
}
