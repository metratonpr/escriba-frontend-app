import React, { useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEmployees } from "../../services/employeeService";


interface Option {
  id: string | number;
  label: string;
}

interface EmployeeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function EmployeeAutocompleteField({
  label = "Funcionário",
  value,
  onChange,
  disabled = false,
  className = "",
}: EmployeeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEmployees({ search: "", page: 1, perPage: 100 }) // ajuste se necessário
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data;
        const formatted = data.map((emp: any) => ({
          id: emp.id,
          label: emp.name,
        }));
        setOptions(formatted);
      })
      .catch(() => {
        setError("Erro ao carregar funcionários.");
      });
  }, []);

  return (
    <>
      <FormAutocompleteField
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </>
  );
}
