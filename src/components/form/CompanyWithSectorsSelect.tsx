// src/components/form/CompanyWithSectorsSelect.tsx
import { useEffect, useState } from "react";
import { getCompanies } from "../../services/companyService";
import FormAutocompleteField from "./FormAutocompleteField";
import FormSelectField from "./FormSelectField";

interface SectorOption {
  id: number;
  name: string;
}

interface CompanyOption {
  id: number;
  name: string;
  sectors: SectorOption[];
}

interface Props {
  companyId: number | null;
  sectorId: number | null;
  onCompanyChange: (value: number | null) => void;
  onSectorChange: (value: number | null) => void;
  companyError?: string;
  sectorError?: string;
}

const CompanyWithSectorsSelect = ({
  companyId,
  sectorId,
  onCompanyChange,
  onSectorChange,
  companyError,
  sectorError,
}: Props) => {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyOption[]>([]);
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await getCompanies();
        const rawData = response?.data || [];
        const data: CompanyOption[] = rawData.map((c: any) => ({
          id: c.id,
          name: c.name,
          sectors: c.sectors || c.company_sectors || [],
        }));

        setCompanies(data);
        setFilteredCompanies(data);

        const preSelected = data.find((c) => c.id === companyId);
        if (preSelected) setSectors(preSelected.sectors || []);
        setLoadError(null);
      } catch (e) {
        console.error("Erro ao carregar empresas:", e);
        setLoadError("Erro ao carregar empresas.");
        setCompanies([]);
        setFilteredCompanies([]);
      }
    };

    loadCompanies();
  }, [companyId]);

  const handleCompanySelect = (selectedId: number | null) => {
    const selected = companies.find((c) => c.id === selectedId);
    if (selected) {
      setSectors(selected.sectors || []);
      onSectorChange(null);
    } else {
      setSectors([]);
    }
    onCompanyChange(selectedId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <FormAutocompleteField
          label="Empresa"
          options={filteredCompanies.map((c) => ({ id: c.id, label: c.name }))}
          value={
            companyId
              ? {
                  id: companyId,
                  label: companies.find((c) => c.id === companyId)?.name || "",
                }
              : null
          }
          onChange={(opt) => handleCompanySelect(opt ? Number(opt.id) : null)}
          onInputChange={(text: string) => {
            const filtered = companies.filter((company) =>
              company.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCompanies(filtered);
          }}
          error={companyError || loadError || undefined}
        />
        {loadError && <p className="text-sm text-red-600 mt-1">{loadError}</p>}
      </div>

      <FormSelectField
        label="Setor"
        name="sector_id"
        value={sectorId ?? ""}
        onChange={(e) => onSectorChange(Number(e.target.value))}
        options={sectors.map((s) => ({ value: s.id, label: s.name }))}
        error={sectorError}
        placeholder="Selecione o setor"
        disabled={sectors.length === 0}
      />
    </div>
  );
};

export default CompanyWithSectorsSelect;
