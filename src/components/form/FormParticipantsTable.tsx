import { useState } from "react";
import md5 from "md5";
import EmployeeAutocompleteField from "./EmployeeAutocompleteField";
import { FormInput } from "./FormInput";
import { FormTextArea } from "./FormTextArea";
import FormSwitchField from "./FormSwitchField";
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
  const formatPresence = (value: number) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return "0%";
    return `${parsed.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}%`;
  };

  const [current, setCurrent] = useState<{
    employee: { id: number; label: string } | null;
    certificate_number: string;
    presence: string;
    evaluation: string;
    emitir_certificado: boolean;
  }>({
    employee: null,
    certificate_number: "",
    presence: "100",
    evaluation: "",
    emitir_certificado: true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      setFieldErrors({ employee: "Colaborador é obrigatório." });
      return;
    }

    const cert = current.certificate_number.trim();
    const parsedPresence = Number(current.presence.toString().replace(",", "."));
    if (current.presence.trim() === "" || Number.isNaN(parsedPresence) || parsedPresence < 0 || parsedPresence > 100) {
      setFieldErrors({ presence: "A presença deve estar entre 0 e 100." });
      return;
    }

    const duplicate = participants.some(
      (p) => p.employee_id === current.employee!.id || p.certificate_number === cert
    );

    if (duplicate) {
      setFieldErrors({
        employee: "Colaborador e certificado devem ser únicos.",
        certificate_number: "Número obrigatório e único.",
      });
      return;
    }

    onChange([
      ...participants,
      {
        event_id: eventId,
        employee_id: current.employee.id,
        employee: { id: current.employee.id, name: current.employee.label },
        certificate_number: cert,
        presence: parsedPresence,
        evaluation: current.evaluation.trim(),
        emitir_certificado: current.emitir_certificado,
      },
    ]);

    setCurrent({
      employee: null,
      certificate_number: "",
      presence: "100",
      evaluation: "",
      emitir_certificado: true,
    });
    setFieldErrors({});
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

        <FormInput
          id="certificate_number"
          name="certificate_number"
          label="Número do certificado"
          value={current.certificate_number}
          onChange={(e) => {
            const value = e.target.value;
            setCurrent((prev) => ({ ...prev, certificate_number: value }));
          }}
          error={fieldErrors.certificate_number}
          disabled
        />
      </div>

      {fieldErrors.employee && <p className="text-sm text-red-600">{fieldErrors.employee}</p>}

      <FormInput
        id="presence"
        name="presence"
        label="Presença (%)"
        type="number"
        min={0}
        max={100}
        step="0.01"
        value={current.presence}
        onChange={(e) => setCurrent((prev) => ({ ...prev, presence: e.target.value }))}
        error={fieldErrors.presence}
      />

      <FormTextArea
        id="evaluation"
        name="evaluation"
        label="Avaliação"
        value={current.evaluation}
        onChange={(e) => setCurrent((prev) => ({ ...prev, evaluation: e.target.value }))}
      />

      <FormSwitchField
        label="Emitir certificado"
        name="emitir_certificado"
        checked={current.emitir_certificado}
        onChange={(e) =>
          setCurrent((prev) => ({
            ...prev,
            emitir_certificado: e.target.checked,
          }))
        }
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
                <th className="px-4 py-2">Emitir</th>
                <th className="px-4 py-2">Presença</th>
                <th className="px-4 py-2">Avaliação</th>
                <th className="px-4 py-2">Certificado</th>
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
                    <td className="px-4 py-2">{formatPresence(Number(participant.presence ?? 0))}</td>
                    <td className="px-4 py-2">{participant.evaluation || ""}</td>
                    <td className="px-4 py-2">{participant.emitir_certificado ? "Sim" : "Não"}</td>
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



