import { useState } from "react";
import md5 from "md5";
import EmployeeAutocompleteField from "./EmployeeAutocompleteField";
import { FormInput } from "./FormInput";
import FormSwitchField from "./FormSwitchField";
import { FormTextArea } from "./FormTextArea";
import type { Participant } from "../../types/participant";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";
import { useClientPagination } from "../../hooks/useClientPagination";
import InlinePagination from "../Layout/ui/InlinePagination";

interface Props {
  eventId: number;
  participants: Participant[];
  onChange: (participants: Participant[]) => void;
  error?: FieldErrorValue;
}

export default function FormParticipantsTable({
  eventId,
  participants,
  onChange,
  error,
}: Props) {
  const [current, setCurrent] = useState<{
    employee: { id: number; label: string } | null;
    certificate_number: string;
    presence: boolean;
    evaluation: string;
  }>({
    employee: null,
    certificate_number: "",
    presence: true,
    evaluation: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    employee: false,
    certificate_number: false,
  });

  const errorMessage = normalizeFieldError(error);
  const {
    currentPage,
    perPage,
    total,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPerPage,
  } = useClientPagination(participants, { initialPerPage: 5 });

  const generateCertNumber = (employeeName: string) => {
    const hash = md5(employeeName + Date.now().toString());
    return `${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
  };

  const handleAdd = () => {
    if (!current.employee) {
      setFieldErrors({ employee: true, certificate_number: false });
      return;
    }

    const cert = current.certificate_number.trim();
    const duplicate = participants.some(
      (p) => p.employee_id === current.employee!.id || p.certificate_number === cert
    );

    if (duplicate) {
      setFieldErrors({ employee: true, certificate_number: true });
      return;
    }

    onChange([
      ...participants,
      {
        event_id: eventId,
        employee_id: current.employee.id,
        employee: { id: current.employee.id, name: current.employee.label },
        certificate_number: cert,
        presence: current.presence,
        evaluation: current.evaluation.trim(),
      },
    ]);

    setCurrent({
      employee: null,
      certificate_number: "",
      presence: true,
      evaluation: "",
    });
    setFieldErrors({ employee: false, certificate_number: false });
  };

  const handleEmployeeChange = (value: { id: string | number; label: string } | null) => {
    if (value) {
      const numericId = typeof value.id === "string" ? parseInt(value.id, 10) : value.id;
      setCurrent((prev) => ({
        ...prev,
        employee: { id: numericId, label: value.label },
        certificate_number: generateCertNumber(value.label),
      }));
      return;
    }

    setCurrent((prev) => ({ ...prev, employee: null, certificate_number: "" }));
  };

  const handleRemove = (index: number) => {
    const updated = [...participants];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <EmployeeAutocompleteField
          value={current.employee}
          onChange={handleEmployeeChange}
          className="md:col-span-2"
        />
        {fieldErrors.employee && <p className="text-sm text-red-600">Colaborador é obrigatório.</p>}

        <FormInput
          id="certificate_number"
          name="certificate_number"
          label="Número do certificado"
          value={current.certificate_number}
          onChange={() => {}}
          error={fieldErrors.certificate_number ? "Número obrigatório e único." : ""}
          disabled
        />
      </div>

      <FormSwitchField
        label="Presença"
        name="presence"
        checked={current.presence}
        onChange={(e) => setCurrent((prev) => ({ ...prev, presence: e.target.checked }))}
      />

      <FormTextArea
        id="evaluation"
        name="evaluation"
        label="Avaliação"
        value={current.evaluation}
        onChange={(e) => setCurrent((prev) => ({ ...prev, evaluation: e.target.value }))}
      />

      <button
        type="button"
        onClick={handleAdd}
        className="h-10 rounded bg-blue-600 px-4 text-white transition hover:bg-blue-700"
      >
        Adicionar Participante
      </button>

      {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}

      {participants.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2">Colaborador</th>
                <th className="px-4 py-2">Certificado</th>
                <th className="px-4 py-2">Presença</th>
                <th className="px-4 py-2">Avaliação</th>
                <th className="px-4 py-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((participant, index) => {
                const absoluteIndex = (currentPage - 1) * perPage + index;

                return (
                  <tr key={`${participant.employee_id}-${absoluteIndex}`} className="border-b">
                    <td className="px-4 py-2">{participant.employee?.name}</td>
                    <td className="px-4 py-2">{participant.certificate_number}</td>
                    <td className="px-4 py-2">{participant.presence ? "Sim" : "Não"}</td>
                    <td className="px-4 py-2">{participant.evaluation || ""}</td>
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
    </div>
  );
}



