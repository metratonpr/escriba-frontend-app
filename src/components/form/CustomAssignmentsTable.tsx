import React, { useState } from "react";
import FormDatePickerField from "../../components/form/FormDatePickerField";
import { convertToBrazilianDateTimeFormat } from "../../utils/formatUtils";
import CompanySectorAutocompleteField from "../../components/form/CompanySectorAutocompleteField";
import JobTitleAutocompleteField from "../../components/form/JobTitleAutocompleteField";

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
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedSector, setSelectedSector] = useState<any>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleAdd = () => {
    if (!selectedCompany || !selectedSector || !selectedJobTitle || !startDate) return;

    const isDuplicate = value.some(item =>
      item.company_sector_id === selectedSector.id &&
      item.job_title_id === selectedJobTitle.id &&
      item.start_date === startDate
    );
    if (isDuplicate) {
      alert("Essa combinação já foi adicionada.");
      return;
    }

    const newItem: CustomAssignment = {
      company_sector_id: selectedSector.id,
      company_name: selectedCompany?.label || "",
      sector_name: selectedSector.label,
      job_title_id: selectedJobTitle.id,
      job_title_name: selectedJobTitle.label,
      start_date: startDate,
      end_date: endDate,
    };
    onChange([...value, newItem]);
    resetFields();
  };

  const resetFields = () => {
    setSelectedCompany(null);
    setSelectedSector(null);
    setSelectedJobTitle(null);
    setStartDate("");
    setEndDate("");
  };

  const handleRemove = (idx: number) => {
    const updated = [...value];
    updated.splice(idx, 1);
    onChange(updated);
  };

  const isEnabled = !!selectedCompany && !!selectedSector;

  return (
    <div className="space-y-4">
        <CompanySectorAutocompleteField
          company={selectedCompany}
          sector={selectedSector}
          onChange={({ company, sector }) => {
            setSelectedCompany(company);
            setSelectedSector(sector);
          }}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">

        <JobTitleAutocompleteField
          value={selectedJobTitle}
          onChange={setSelectedJobTitle}
          disabled={!isEnabled}
        />

        <FormDatePickerField
          name="start_date"
          label="Data Início"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={!isEnabled}
        />

        <FormDatePickerField
          name="end_date"
          label="Data Fim"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={!isEnabled}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={handleAdd}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          disabled={!isEnabled}
        >
          Adicionar
        </button>
      </div>

      {value.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2">Empresa</th>
                <th scope="col" className="px-4 py-2">Setor</th>
                <th scope="col" className="px-4 py-2">Cargo</th>
                <th scope="col" className="px-4 py-2">Início</th>
                <th scope="col" className="px-4 py-2">Fim</th>
                <th scope="col" className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {value.map((item, idx) => (
                <tr key={idx} className="bg-white border-b">
                  <td className="px-4 py-2">{item.company_name}</td>
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

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
