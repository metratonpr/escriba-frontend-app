// src/components/form/CustomAssignmentsTable.tsx
import { useEffect, useMemo, useState } from "react";
import FormDatePickerField from "../../components/form/FormDatePickerField";
import { convertToBrazilianDateTimeFormat } from "../../utils/formatUtils";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import debounce from "lodash/debounce";
import { getCompanies, type CompanyResponse } from "../../services/companyService";
import { getJobTitles, type JobTitle } from "../../services/jobTitleService";
import { getSectors } from "../../services/sectorService";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";
import { useClientPagination } from "../../hooks/useClientPagination";
import InlinePagination from "../Layout/ui/InlinePagination";

interface Option<T = unknown> {
  id: string | number;
  label: string;
  _original?: T;
}

interface CompanySectorRelation {
  id: string | number;
  sector?: {
    id?: string | number | null;
    name?: string | null;
  } | null;
}

type CompanyWithSectorVariants = CompanyResponse & {
  companySectors?: CompanySectorRelation[];
};

type CompanyOption = Option<CompanyWithSectorVariants>;
type SectorOption = Option<CompanySectorRelation>;
type JobTitleOption = Option<JobTitle>;

export interface CustomAssignment {
  company_sector_id: number;
  company_name: string;
  sector_name: string;
  job_title_id: number;
  job_title_name: string;
  start_date: string;
  end_date: string;
}

interface Props {
  value: CustomAssignment[];
  onChange: (assignments: CustomAssignment[]) => void;
  error?: FieldErrorValue;
}

export default function CustomAssignmentsTable({ value, onChange, error }: Props) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  const [selectedSector, setSelectedSector] = useState<SectorOption | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitleOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [companyQuery, setCompanyQuery] = useState("");
  const [sectorQuery, setSectorQuery] = useState("");
  const [jobTitleQuery, setJobTitleQuery] = useState("");
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [sectorOptions, setSectorOptions] = useState<SectorOption[]>([]);
  const [jobTitleOptions, setJobTitleOptions] = useState<JobTitleOption[]>([]);
  const [sectorLoadError, setSectorLoadError] = useState<string | null>(null);
  const errorMessage = normalizeFieldError(error);
  const {
    currentPage,
    perPage,
    total,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPerPage,
  } = useClientPagination(value, { initialPerPage: 5 });

  const fetchCompanies = useMemo(
    () =>
      debounce(async (term: string) => {
        try {
          const response = await getCompanies({ search: term, page: 1, perPage: 25 });
          setCompanyOptions(
            response.data.map((company) => ({
              id: company.id,
              label: company.name,
              _original: company,
            }))
          );
        } catch {
          setCompanyOptions([]);
        }
      }, 300),
    []
  );

  const fetchJobTitles = useMemo(
    () =>
      debounce(async (term: string) => {
        try {
          const response = await getJobTitles({ search: term, page: 1, perPage: 25 });
          setJobTitleOptions(
            response.data.map((jobTitle) => ({
              id: jobTitle.id,
              label: jobTitle.name,
              _original: jobTitle,
            }))
          );
        } catch {
          setJobTitleOptions([]);
        }
      }, 300),
    []
  );

  const fetchSectors = useMemo(
    () =>
      debounce(async (term: string, company: CompanyWithSectorVariants) => {
        try {
          const response = await getSectors({ search: term, page: 1, perPage: 25 });
          const allowedSectorIds = new Set(
            response.data.map((sector) => String(sector.id))
          );
          const companySectors = company.company_sectors ?? company.companySectors ?? [];

          setSectorOptions(
            companySectors
              .filter((companySector) =>
                allowedSectorIds.has(String(companySector.sector?.id ?? ""))
              )
              .map((companySector) => ({
                id: companySector.id,
                label: companySector.sector?.name ?? "Setor desconhecido",
                _original: companySector,
              }))
          );
          setSectorLoadError(null);
        } catch {
          setSectorLoadError("Erro ao buscar setores.");
          setSectorOptions([]);
        }
      }, 300),
    []
  );

  useEffect(() => {
    fetchCompanies(companyQuery);
    return () => fetchCompanies.cancel();
  }, [companyQuery, fetchCompanies]);

  useEffect(() => {
    fetchJobTitles(jobTitleQuery);
    return () => fetchJobTitles.cancel();
  }, [jobTitleQuery, fetchJobTitles]);

  useEffect(() => {
    const company = selectedCompany?._original;
    if (!company) {
      setSectorOptions([]);
      setSectorLoadError(null);
      return;
    }

    const companySectors = company.company_sectors ?? company.companySectors ?? [];

    if (!sectorQuery.trim()) {
      setSectorOptions(
        companySectors.map((companySector) => ({
          id: companySector.id,
          label: companySector.sector?.name ?? "Setor desconhecido",
          _original: companySector,
        }))
      );
      setSectorLoadError(null);
      return;
    }

    fetchSectors(sectorQuery, company);
    return () => fetchSectors.cancel();
  }, [fetchSectors, sectorQuery, selectedCompany]);

  const visibleSectorOptions = useMemo(() => {
    if (
      selectedSector &&
      !sectorOptions.some((option) => String(option.id) === String(selectedSector.id))
    ) {
      return [selectedSector, ...sectorOptions];
    }

    return sectorOptions;
  }, [sectorOptions, selectedSector]);

  const handleAdd = () => {
    if (!selectedCompany || !selectedSector || !selectedJobTitle || !startDate) return;
    if (endDate && new Date(endDate) < new Date(startDate)) {
      alert("A data de fim não pode ser anterior à data de início.");
      return;
    }

    const companySectorId = Number(selectedSector._original?.id ?? selectedSector.id);
    const jobTitleId = Number(selectedJobTitle.id);

    const duplicate = value.some(item =>
      item.company_sector_id === companySectorId &&
      item.job_title_id === jobTitleId &&
      item.start_date === startDate
    );
    if (duplicate) {
      alert("Essa combinação já foi adicionada.");
      return;
    }

    onChange([
      ...value,
      {
        company_sector_id: companySectorId,
        company_name: selectedCompany.label,
        sector_name: selectedSector.label,
        job_title_id: jobTitleId,
        job_title_name: selectedJobTitle.label,
        start_date: startDate,
        end_date: endDate,
      },
    ]);
    resetFields();
  };

  const resetFields = () => {
    setSelectedCompany(null);
    setSelectedSector(null);
    setSelectedJobTitle(null);
    setStartDate("");
    setEndDate("");
    setSectorQuery("");
    setSectorOptions([]);
    setSectorLoadError(null);
  };

  const handleRemove = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-3">
        <FormAutocompleteField
          name="company_id"
          label="Empresa"
          value={selectedCompany}
          options={companyOptions}
          onChange={(v) => {
            setSelectedCompany(v);
            setSelectedSector(null);
            setSelectedJobTitle(null);
            setSectorQuery("");
            setSectorOptions([]);
            setSectorLoadError(null);
          }}
          onInputChange={setCompanyQuery}
        />
        <div>
          <FormAutocompleteField
          name="sector_id"
          label="Setor"
            value={selectedSector}
            options={visibleSectorOptions}
            onChange={setSelectedSector}
            onInputChange={setSectorQuery}
            disabled={!selectedCompany}
          />
          {sectorLoadError && (
            <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
              {sectorLoadError}
            </p>
          )}
        </div>
        <FormAutocompleteField
          name="job_title_id"
          label="Cargo"
          value={selectedJobTitle}
          options={jobTitleOptions}
          onChange={setSelectedJobTitle}
          onInputChange={setJobTitleQuery}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <FormDatePickerField
          name="start_date"
          label="Data Início"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <FormDatePickerField
          name="end_date"
          label="Data Fim"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAdd}
            className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Adicionar
          </button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="relative overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2 font-semibold">Empresa</th>
                <th className="px-4 py-2 font-semibold">Setor</th>
                <th className="px-4 py-2 font-semibold">Cargo</th>
                <th className="px-4 py-2 font-semibold">Início</th>
                <th className="px-4 py-2 font-semibold">Fim</th>
                <th className="px-4 py-2 text-center w-28">Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, idx) => {
                const absoluteIndex = (currentPage - 1) * perPage + idx;

                return (
                  <tr key={absoluteIndex} className="bg-white border-b dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.company_name}</td>
                    <td className="px-4 py-2">{item.sector_name}</td>
                    <td className="px-4 py-2">{item.job_title_name}</td>
                    <td className="px-4 py-2">{convertToBrazilianDateTimeFormat(item.start_date)}</td>
                    <td className="px-4 py-2">{item.end_date ? convertToBrazilianDateTimeFormat(item.end_date) : ""}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(absoluteIndex)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <InlinePagination
            className="mt-3"
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </div>
      )}

      {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
    </div>
  );
}
