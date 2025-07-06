import React, { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import FormSelectField from "./FormSelectField";
import debounce from "lodash/debounce";
import { getCompanies } from "../../services/companyService";

interface Option {
  id: string | number;
  label: string;
  _original?: any;
}

interface Props {
  company: Option | null;
  sector: Option | null;
  onChange: (payload: { company: Option | null; sector: Option | null }) => void;
  disabled?: boolean;
  className?: string;
}

export default function CompanySectorAutocompleteField({
  company,
  sector,
  onChange,
  disabled = false,
  className = "",
}: Props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [sectors, setSectors] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getCompanies({ search: term, page: 1, perPage: 25 });
        const data = Array.isArray(response) ? response : response.data;
        const formatted: Option[] = data.map((company: any) => ({
          id: company.id,
          label: company.name,
          _original: company,
        }));
        setOptions(formatted);
        setError(null);
      } catch {
        setError("Erro ao buscar empresas.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchCompanies(query);
    return () => fetchCompanies.cancel();
  }, [query, fetchCompanies]);

  useEffect(() => {
    if (company?._original?.company_sectors) {
      const formatted = company._original.company_sectors.map((cs: any) => ({
        id: cs.sector.id,
        label: cs.sector.name,
        _original: cs,
      }));
      setSectors(formatted);
    } else {
      setSectors([]);
    }
  }, [company]);

  const handleCompanyChange = (selected: Option | null) => {
    onChange({ company: selected, sector: null });
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sectors.find((s) => String(s.id) === e.target.value);
    onChange({
      company,
      sector: selected ? { ...selected, id: selected._original.id } : null,
    });
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        <FormAutocompleteField
          name="company_id"
          label="Empresa"
          value={company}
          options={options}
          onChange={handleCompanyChange}
          onInputChange={setQuery}
          disabled={disabled}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      <div>
        <FormSelectField
          label="Setor"
          name="company_sector_id"
          value={sector?.id || ""}
          onChange={handleSectorChange}
          options={sectors.map((s) => ({ value: s.id, label: s.label }))}
          disabled={disabled || sectors.length === 0}
        />
      </div>
    </div>
  );
}
