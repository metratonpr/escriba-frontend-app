import  { useEffect, useState } from "react";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import FormSelectField from "../../components/form/FormSelectField";
import FormDatePickerField from "../../components/form/FormDatePickerField";
import { getCompanies } from "../../services/companyService";
import { getJobTitles } from "../../services/jobTitleService";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";
import { useClientPagination } from "../../hooks/useClientPagination";
import InlinePagination from "../Layout/ui/InlinePagination";

interface Assignment {
  company_sector_id: number;
  company_name: string;
  sector_name: string;
  job_title_id: number;
  job_title_name: string;
  start_date: string;
  end_date: string;
}

interface Props {
  value: Assignment[];
  onChange: (assignments: Assignment[]) => void;
  error?: FieldErrorValue;
}

export default function AssignmentsRepeater({ value, onChange, error }: Props) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobTitles, setJobTitles] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);

  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedSector, setSelectedSector] = useState<any>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

  useEffect(() => {
    getCompanies().then(res => {
      const data = Array.isArray(res) ? res : res.data;
      setCompanies(data.map((c: any) => ({ id: c.id, label: c.name, sectors: c.sectors })));
    });
    getJobTitles().then(res => {
      const data = Array.isArray(res) ? res : res.data;
      setJobTitles(data.map((j: any) => ({ id: j.id, label: j.name })));
    });
  }, []);

  const handleCompanySelect = (opt: any) => {
    setSelectedCompany(opt);
    setSelectedSector(null);
    const found = companies.find(c => c.id === opt?.id);
    setSectors(found?.sectors.map((s: any) => ({ id: s.id, label: s.name })) || []);
  };

  const handleAdd = () => {
    if (!selectedCompany || !selectedSector || !selectedJobTitle || !startDate) return;
    const newItem: Assignment = {
      company_sector_id: selectedSector.id,
      company_name: selectedCompany.label,
      sector_name: selectedSector.label,
      job_title_id: selectedJobTitle.id,
      job_title_name: selectedJobTitle.label,
      start_date: startDate,
      end_date: endDate,
    };
    onChange([...value, newItem]);
    setSelectedCompany(null);
    setSelectedSector(null);
    setSelectedJobTitle(null);
    setStartDate("");
    setEndDate("");
    setSectors([]);
  };

  const handleRemove = (idx: number) => {
    const updated = [...value];
    updated.splice(idx, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormAutocompleteField
          label="Empresa"
          options={companies}
          value={selectedCompany}
          onChange={handleCompanySelect}
        />
        <FormAutocompleteField
          label="Setor"
          options={sectors}
          value={selectedSector}
          onChange={setSelectedSector}
        />
        <FormSelectField
          label="Cargo"
          name="job_title_id"
          value={selectedJobTitle?.id || ""}
          onChange={(e) => {
            const opt = jobTitles.find(j => j.id === Number(e.target.value));
            setSelectedJobTitle(opt || null);
          }}
          options={jobTitles.map(j => ({ value: j.id, label: j.label }))}
        />
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
            className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            onClick={handleAdd}
          >
            Adicionar
          </button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-2">Empresa</th>
                <th className="px-4 py-2">Setor</th>
                <th className="px-4 py-2">Cargo</th>
                <th className="px-4 py-2">Início</th>
                <th className="px-4 py-2">Fim</th>
                <th className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, idx) => {
                const absoluteIndex = (currentPage - 1) * perPage + idx;

                return (
                  <tr key={absoluteIndex} className="bg-white border-b">
                    <td className="px-4 py-2">{item.company_name}</td>
                    <td className="px-4 py-2">{item.sector_name}</td>
                    <td className="px-4 py-2">{item.job_title_name}</td>
                    <td className="px-4 py-2">{item.start_date}</td>
                    <td className="px-4 py-2">{item.end_date}</td>
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

      {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
    </div>
  );
}
