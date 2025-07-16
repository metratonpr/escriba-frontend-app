import { useState } from "react";
import md5 from "md5"; // instale com: npm i md5 && npm i -D @types/md5
import EmployeeAutocompleteField from "./EmployeeAutocompleteField";
import { FormInput } from "./FormInput";
import FormSwitchField from "./FormSwitchField";
import { FormTextArea } from "./FormTextArea";
import type { Participant } from "../../types/participant";



interface Props {
  eventId: number;
  participants: Participant[];
  onChange: (participants: Participant[]) => void;
  error?: string;
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
      (p) =>
        p.employee_id === current.employee!.id ||
        p.certificate_number === cert
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
      setCurrent({
        ...current,
        employee: { id: numericId, label: value.label },
        certificate_number: generateCertNumber(value.label),
      });
    } else {
      setCurrent({ ...current, employee: null, certificate_number: "" });
    }
  };

  const handleRemove = (index: number) => {
    const updated = [...participants];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <EmployeeAutocompleteField
          value={current.employee}
          onChange={handleEmployeeChange}
          className="md:col-span-2"
        />
        {fieldErrors.employee && (
          <p className="text-sm text-red-600">Colaborador é obrigatório</p>
        )}

        <FormInput
          id="certificate_number"
          name="certificate_number"
          label="Número do certificado"
          value={current.certificate_number}
          onChange={() => {}}
          error={
            fieldErrors.certificate_number ? "Número obrigatório e único" : ""
          }
          disabled
        />
      </div>

      <FormSwitchField
        label="Presença"
        name="presence"
        checked={current.presence}
        onChange={(e) =>
          setCurrent((prev) => ({ ...prev, presence: e.target.checked }))
        }
      />

      <FormTextArea
        id="evaluation"
        name="evaluation"
        label="Avaliação"
        value={current.evaluation}
        onChange={(e) =>
          setCurrent((prev) => ({ ...prev, evaluation: e.target.value }))
        }
      />

      <button
        type="button"
        onClick={handleAdd}
        className="h-10 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Adicionar Participante
      </button>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {participants.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-gray-700">
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
              {participants.map((p, index) => (
                <tr key={`${p.employee_id}-${index}`} className="border-b">
                  <td className="px-4 py-2">{p.employee?.name}</td>
                  <td className="px-4 py-2">{p.certificate_number}</td>
                  <td className="px-4 py-2">{p.presence ? "Sim" : "Não"}</td>
                  <td className="px-4 py-2">{p.evaluation || "-"}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
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
    </div>
  );
}
