// ✅ CompanyWithSectorAutocompleteField.tsx
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
        console.log(data);
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
    if (company?._original?.sectors) {
      const formatted = company._original.sectors.map((s: any) => ({
        id: s.id,
        label: s.name,
      }));
      setSectors(formatted);
    } else {
      setSectors([]);
    }
  }, [company]);

  const handleCompanyChange = (selected: Option | null) => {
    onChange({ company: selected, sector: null });
  };

  const isInvalid = !company || !sector;

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
          required
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      <div>
        <FormSelectField
          label="Setor"
          name="company_sector_id"
          value={sector?.id || ""}
          onChange={(e) => {
            const selected = sectors.find((s) => String(s.id) === e.target.value);
            onChange({ company, sector: selected || null });
          }}
          options={sectors.map((s) => ({ value: s.id, label: s.label }))}
          disabled={disabled || sectors.length === 0}
          required
        />
      </div>

      {isInvalid && (
        <div className="col-span-2">
          <p className="text-sm text-red-600">Preencha todos os campos obrigatórios.</p>
        </div>
      )}
    </div>
  );
}
