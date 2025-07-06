import React, { useCallback, useEffect, useState } from "react";
import FormDatePickerField from "../../components/form/FormDatePickerField";
import { convertToBrazilianDateTimeFormat } from "../../utils/formatUtils";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import debounce from "lodash/debounce";
import { getCompanies } from "../../services/companyService";
import { getJobTitles } from "../../services/jobTitleService";
import FormSelectField from "./FormSelectField";

interface Option {
  id: string | number;
  label: string;
  _original?: any;
}

interface CustomAssignment {
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
  error?: string;
}

export default function CustomAssignmentsTable({ value, onChange, error }: Props) {
  const [selectedCompany, setSelectedCompany] = useState<Option | null>(null);
  const [selectedSector, setSelectedSector] = useState<Option | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<Option | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [companyQuery, setCompanyQuery] = useState("");
  const [jobTitleQuery, setJobTitleQuery] = useState("");
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [sectorOptions, setSectorOptions] = useState<Option[]>([]);
  const [jobTitleOptions, setJobTitleOptions] = useState<Option[]>([]);

  const fetchCompanies = useCallback(debounce(async (term: string) => {
    try {
      const response = await getCompanies({ search: term, page: 1, perPage: 25, has_sector: 1 });
      const data = Array.isArray(response) ? response : response.data;
      setCompanyOptions(data.map((c: any) => ({ id: c.id, label: c.name, _original: c })));
    } catch {
      setCompanyOptions([]);
    }
  }, 300), []);

  const fetchJobTitles = useCallback(debounce(async (term: string) => {
    try {
      const response = await getJobTitles({ search: term, page: 1, perPage: 25 });
      const data = Array.isArray(response) ? response : response.data;
      setJobTitleOptions(data.map((j: any) => ({ id: j.id, label: j.name })));
    } catch {
      setJobTitleOptions([]);
    }
  }, 300), []);

  useEffect(() => {
    fetchCompanies(companyQuery);
    return () => fetchCompanies.cancel();
  }, [companyQuery, fetchCompanies]);

  useEffect(() => {
    fetchJobTitles(jobTitleQuery);
    return () => fetchJobTitles.cancel();
  }, [jobTitleQuery, fetchJobTitles]);

  useEffect(() => {
    const extractSectorsFromCompany = (company: any): Option[] => {
      const sectors = company?.company_sectors ?? company?.companySectors ?? [];
      return sectors.map((cs: any) => ({
        id: cs.id,
        label: cs.sector?.name ?? "Setor desconhecido",
        _original: cs,
      }));
    };

    setSectorOptions(selectedCompany ? extractSectorsFromCompany(selectedCompany._original) : []);
  }, [selectedCompany]);

  const handleAdd = () => {
    if (!selectedCompany || !selectedSector || !selectedJobTitle || !startDate) return;
    if (endDate && new Date(endDate) < new Date(startDate)) {
      alert("A data de fim não pode ser anterior à data de início.");
      return;
    }

    const companySectorId = Number(selectedSector._original?.id ?? selectedSector.id);
    const duplicate = value.some(item =>
      item.company_sector_id === companySectorId &&
      item.job_title_id === selectedJobTitle.id &&
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
        job_title_id: selectedJobTitle.id,
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
    setSectorOptions([]);
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
            setSectorOptions([]);
          }}
          onInputChange={setCompanyQuery}
        />
        <FormSelectField
          name="sector_id"
          label="Setor"
          value={selectedSector?.id ?? ""}
          onChange={(e) => {
            const selected = sectorOptions.find(opt => String(opt.id) === e.target.value);
            setSelectedSector(selected || null);
          }}
          options={sectorOptions.map(opt => ({ value: opt.id, label: opt.label }))}
        />
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
              {value.map((item, idx) => (
                <tr key={idx} className="bg-white border-b dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.company_name}</td>
                  <td className="px-4 py-2">{item.sector_name}</td>
                  <td className="px-4 py-2">{item.job_title_name}</td>
                  <td className="px-4 py-2">{convertToBrazilianDateTimeFormat(item.start_date)}</td>
                  <td className="px-4 py-2">{item.end_date ? convertToBrazilianDateTimeFormat(item.end_date) : ""}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
