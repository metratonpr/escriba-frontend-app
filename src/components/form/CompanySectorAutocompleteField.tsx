import { useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import FormSelectField from "./FormSelectField";
import {
  getCompaniesWithSectors,
  type CompanyResponse,
} from "../../services/companyService";
import { mergeSelectedOption, type AutocompleteOption } from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface Props {
  company: Option | null;
  sector: Option | null;
  onChange: (payload: { company: Option | null; sector: Option | null }) => void;
  companyRequired?: boolean;
  sectorRequired?: boolean;
  disabled?: boolean;
  className?: string;
  companyLabel?: string;
  sectorLabel?: string;
  companyName?: string;
  sectorName?: string;
  companyError?: string;
  sectorError?: string;
  sectorValueMode?: "companySector" | "sector";
  initialCompanies?: CompanyResponse[];
}

type CompanyOption = Option & {
  _original?: CompanyResponse;
};

type CompanySectorRelation = NonNullable<CompanyResponse["company_sectors"]>[number];

type SectorOption = Option & {
  _original?: CompanySectorRelation;
};

function mapCompanyToOption(company: CompanyResponse): CompanyOption {
  return {
    id: company.id,
    label: company.name,
    _original: company,
  };
}

export default function CompanySectorAutocompleteField({
  company,
  sector,
  onChange,
  companyRequired = false,
  sectorRequired = false,
  disabled = false,
  className = "",
  companyLabel = "Empresa",
  sectorLabel = "Setor",
  companyName = "company_id",
  sectorName = "company_sector_id",
  companyError,
  sectorError,
  sectorValueMode = "companySector",
  initialCompanies,
}: Props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<CompanyOption[]>(() =>
    mergeSelectedOption((initialCompanies ?? []).map(mapCompanyToOption), company)
  );
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim() && initialCompanies) {
      setOptions(mergeSelectedOption(initialCompanies.map(mapCompanyToOption), company));
      setError(null);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      getCompaniesWithSectors({
        search: query,
        page: 1,
        perPage: 25,
      })
        .then((response) => {
          if (!active) {
            return;
          }

          const data = Array.isArray(response) ? response : response.data;
          setOptions(mergeSelectedOption(data.map(mapCompanyToOption), company));
          setError(null);
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setError("Erro ao buscar empresas.");
          setOptions([]);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [company, initialCompanies, query]);

  useEffect(() => {
    if (!company) {
      setSectors([]);
      return;
    }

    const selectedCompany =
      options.find((option) => String(option.id) === String(company.id)) ?? null;
    const companySectors = selectedCompany?._original?.company_sectors ?? [];

    if (companySectors.length === 0) {
      setSectors(
        sector
          ? [
              {
                id: sector.id,
                label: sector.label,
              },
            ]
          : []
      );
      return;
    }

    setSectors(
      companySectors.map((companySector) => ({
        id:
          sectorValueMode === "companySector"
            ? companySector.id
            : companySector.sector.id,
        label: companySector.sector.name,
        _original: companySector,
      }))
    );
  }, [company, options, sector, sectorValueMode]);

  useEffect(() => {
    if (!company) {
      return;
    }

    const hasHydratedCompany = options.some(
      (option) =>
        String(option.id) === String(company.id) &&
        Boolean(option._original?.company_sectors)
    );

    if (hasHydratedCompany) {
      return;
    }

    getCompaniesWithSectors({
      search: company.label,
      page: 1,
      perPage: 25,
    })
      .then((response) => {
        const data = Array.isArray(response) ? response : response.data;
        const matchedCompany = data.find(
          (item) => String(item.id) === String(company.id)
        );

        if (!matchedCompany) {
          return;
        }

        setOptions((prev) => {
          const filtered = prev.filter(
            (option) => String(option.id) !== String(matchedCompany.id)
          );
          return [mapCompanyToOption(matchedCompany), ...filtered];
        });
      })
      .catch(() => {
        // Keep current value visible even if hydration fails.
      });
  }, [company, options]);

  const handleCompanyChange = (selected: CompanyOption | null) => {
    onChange({ company: selected, sector: null });
  };

  const handleSectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sectors.find((item) => String(item.id) === event.target.value);
    onChange({
      company,
      sector: selected
        ? {
            id: selected.id,
            label: selected.label,
          }
        : null,
    });
  };

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
      <FormAutocompleteField
        name={companyName}
        label={companyLabel}
        value={company}
        options={options}
        onChange={handleCompanyChange}
        onInputChange={setQuery}
        disabled={disabled}
        error={companyError ?? error ?? undefined}
        required={companyRequired}
      />

      <FormSelectField
        label={sectorLabel}
        name={sectorName}
        value={sector?.id || ""}
        onChange={handleSectorChange}
        options={sectors.map((item) => ({ value: item.id, label: item.label }))}
        disabled={disabled || sectors.length === 0}
        error={sectorError}
        required={sectorRequired}
      />
    </div>
  );
}
