import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import FormDatePickerField from "../../components/form/FormDatePickerField";
import FormSelectField from "../../components/form/FormSelectField";
import { useClientPagination } from "../../hooks/useClientPagination";
import {
  getCompaniesWithSectors,
  type CompanyResponse,
} from "../../services/companyService";
import { getJobTitles, type JobTitle } from "../../services/jobTitleService";
import { getSectors } from "../../services/sectorService";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";
import { convertToBrazilianDateTimeFormat } from "../../utils/formatUtils";
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

type AssignmentFieldErrors = {
  company?: string;
  sector?: string;
  jobTitle?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  general?: string;
};

export interface CustomAssignment {
  company_sector_id: number;
  company_name: string;
  sector_name: string;
  job_title_id: number;
  job_title_name: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface Props {
  value: CustomAssignment[];
  onChange: (assignments: CustomAssignment[]) => void;
  error?: FieldErrorValue;
  initialCompanyOptions?: CompanyResponse[];
  initialJobTitleOptions?: JobTitle[];
}

function getDefaultStartDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const ASSIGNMENT_STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

export default function CustomAssignmentsTable({
  value,
  onChange,
  error,
  initialCompanyOptions,
  initialJobTitleOptions,
}: Props) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  const [selectedSector, setSelectedSector] = useState<SectorOption | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitleOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("ativo");
  const [startDate, setStartDate] = useState<string>(() => getDefaultStartDate());
  const [endDate, setEndDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AssignmentFieldErrors>({});

  const [companyQuery, setCompanyQuery] = useState("");
  const [sectorQuery, setSectorQuery] = useState("");
  const [jobTitleQuery, setJobTitleQuery] = useState("");
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>(() =>
    (initialCompanyOptions ?? []).map((company) => ({
      id: company.id,
      label: company.name,
      _original: company,
    }))
  );
  const [sectorOptions, setSectorOptions] = useState<SectorOption[]>([]);
  const [jobTitleOptions, setJobTitleOptions] = useState<JobTitleOption[]>(() =>
    (initialJobTitleOptions ?? []).map((jobTitle) => ({
      id: jobTitle.id,
      label: jobTitle.name,
      _original: jobTitle,
    }))
  );
  const [sectorLoadError, setSectorLoadError] = useState<string | null>(null);
  const [, setIsInitialLoadingCompanies] = useState(true);
  const [, setIsInitialLoadingJobTitles] = useState(true);
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
          const response = await getCompaniesWithSectors({
            search: term,
            page: 1,
            perPage: 25,
          });
          setCompanyOptions(
            response.data.map((company) => ({
              id: company.id,
              label: company.name,
              _original: company,
            }))
          );
        } catch {
          setCompanyOptions([]);
        } finally {
          setIsInitialLoadingCompanies(false);
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
        } finally {
          setIsInitialLoadingJobTitles(false);
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
    if (!companyQuery.trim() && initialCompanyOptions) {
      setCompanyOptions(
        initialCompanyOptions.map((company) => ({
          id: company.id,
          label: company.name,
          _original: company,
        }))
      );
      return;
    }

    fetchCompanies(companyQuery);
    return () => fetchCompanies.cancel();
  }, [companyQuery, fetchCompanies, initialCompanyOptions]);

  useEffect(() => {
    if (!jobTitleQuery.trim() && initialJobTitleOptions) {
      setJobTitleOptions(
        initialJobTitleOptions.map((jobTitle) => ({
          id: jobTitle.id,
          label: jobTitle.name,
          _original: jobTitle,
        }))
      );
      return;
    }

    fetchJobTitles(jobTitleQuery);
    return () => fetchJobTitles.cancel();
  }, [fetchJobTitles, initialJobTitleOptions, jobTitleQuery]);

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
  const clearFieldError = (field: keyof AssignmentFieldErrors) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: undefined,
      general: undefined,
    }));
  };

  const handleAdd = () => {
    const nextErrors: AssignmentFieldErrors = {};

    if (!selectedCompany) {
      nextErrors.company = "Selecione uma empresa.";
    }
    if (!selectedSector) {
      nextErrors.sector = "Selecione um setor.";
    }
    if (!selectedJobTitle) {
      nextErrors.jobTitle = "Selecione um cargo.";
    }
    if (!selectedStatus) {
      nextErrors.status = "Selecione um status.";
    }
    if (!startDate) {
      nextErrors.startDate = "Informe a data de inicio.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const company = selectedCompany;
    const sector = selectedSector;
    const jobTitle = selectedJobTitle;

    if (!company || !sector || !jobTitle) {
      return;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      setFieldErrors({
        endDate: "A data de fim nao pode ser anterior a data de inicio.",
      });
      return;
    }

    const companySectorId = Number(sector._original?.id ?? sector.id);
    const jobTitleId = Number(jobTitle.id);

    const duplicate = value.some(
      (item) =>
        item.company_sector_id === companySectorId &&
        item.job_title_id === jobTitleId &&
        item.start_date === startDate
    );

    if (duplicate) {
      setFieldErrors({ general: "Essa combinacao ja foi adicionada." });
      return;
    }

    setFieldErrors({});
    onChange([
      ...value,
      {
        company_sector_id: companySectorId,
        company_name: company.label,
        sector_name: sector.label,
        job_title_id: jobTitleId,
        job_title_name: jobTitle.label,
        status: selectedStatus,
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
    setSelectedStatus("ativo");
    setStartDate(getDefaultStartDate());
    setEndDate("");
    setSectorQuery("");
    setSectorOptions([]);
    setSectorLoadError(null);
    setFieldErrors({});
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
          onChange={(company) => {
            setSelectedCompany(company);
            setSelectedSector(null);
            setSectorQuery("");
            setSectorOptions([]);
            setSectorLoadError(null);
            clearFieldError("company");
            clearFieldError("sector");
          }}
          onInputChange={setCompanyQuery}
          error={fieldErrors.company}
        />

        <div>
          <FormAutocompleteField
            name="sector_id"
            label="Setor"
            value={selectedSector}
            options={visibleSectorOptions}
            onChange={(sector) => {
              setSelectedSector(sector);
              clearFieldError("sector");
            }}
            onInputChange={setSectorQuery}
            disabled={!selectedCompany}
            error={fieldErrors.sector}
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
          onChange={(jobTitle) => {
            setSelectedJobTitle(jobTitle);
            clearFieldError("jobTitle");
          }}
          onInputChange={setJobTitleQuery}
          error={fieldErrors.jobTitle}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <FormDatePickerField
          name="start_date"
          label="Data Inicio"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            clearFieldError("startDate");
            clearFieldError("endDate");
          }}
          error={fieldErrors.startDate}
        />

        <FormDatePickerField
          name="end_date"
          label="Data Fim"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            clearFieldError("endDate");
          }}
          error={fieldErrors.endDate}
        />

        <FormSelectField
          name="status"
          label="Status"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            clearFieldError("status");
          }}
          options={ASSIGNMENT_STATUS_OPTIONS}
          error={fieldErrors.status}
        />

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAdd}
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Adicionar
          </button>
        </div>
      </div>

      {fieldErrors.general && (
        <p className="text-sm text-red-600" role="alert">
          {fieldErrors.general}
        </p>
      )}

      {value.length > 0 && (
        <div className="relative mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2 font-semibold">Empresa</th>
                <th className="px-4 py-2 font-semibold">Setor</th>
                <th className="px-4 py-2 font-semibold">Cargo</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Inicio</th>
                <th className="px-4 py-2 font-semibold">Fim</th>
                <th className="w-28 px-4 py-2 text-center">Acao</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, idx) => {
                const absoluteIndex = (currentPage - 1) * perPage + idx;

                return (
                  <tr
                    key={absoluteIndex}
                    className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                      {item.company_name}
                    </td>
                    <td className="px-4 py-2">{item.sector_name}</td>
                    <td className="px-4 py-2">{item.job_title_name}</td>
                    <td className="px-4 py-2">
                      {item.status
                        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                        : ""}
                    </td>
                    <td className="px-4 py-2">
                      {convertToBrazilianDateTimeFormat(item.start_date)}
                    </td>
                    <td className="px-4 py-2">
                      {item.end_date
                        ? convertToBrazilianDateTimeFormat(item.end_date)
                        : ""}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(absoluteIndex)}
                        className="text-xs text-red-600 hover:underline"
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

      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
