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
import { generateCertificatePdf } from "../../services/certificateService";

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
  const [certificateMessage, setCertificateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [generatingParticipationId, setGeneratingParticipationId] = useState<number | null>(null);

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
      setFieldErrors({ employee: "Colaborador obrigatorio." });
      return;
    }

    const cert = current.certificate_number.trim();
    const parsedPresence = Number(current.presence.toString().replace(",", "."));

    if (
      current.presence.trim() === "" ||
      Number.isNaN(parsedPresence) ||
      parsedPresence < 0 ||
      parsedPresence > 100
    ) {
      setFieldErrors({ presence: "A presenca deve estar entre 0 e 100." });
      return;
    }

    const duplicate = participants.some(
      (p) => p.employee_id === current.employee!.id || p.certificate_number === cert
    );

    if (duplicate) {
      setFieldErrors({
        employee: "Colaborador e certificado devem ser unicos.",
        certificate_number: "Numero obrigatorio e unico.",
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

  const handleGenerateCertificate = async (participant: Participant) => {
    if (!eventId || eventId <= 0) {
      setCertificateMessage({
        type: "error",
        text: "Salve o evento antes de emitir o certificado.",
      });
      return;
    }

    if (participant.id === undefined || participant.id === null) {
      setCertificateMessage({
        type: "error",
        text: "Salve os participantes antes de emitir o certificado.",
      });
      return;
    }

    const participationId = Number(participant.id);
    if (Number.isNaN(participationId)) {
      setCertificateMessage({
        type: "error",
        text: "Participacao invalida para emissao de certificado.",
      });
      return;
    }

    setGeneratingParticipationId(participationId);
    setCertificateMessage(null);

    try {
      const pdfBlob = await generateCertificatePdf({
        event_id: eventId,
        event_participation_id: participationId,
        participant_name: participant.employee?.name,
        certificate_number: participant.certificate_number,
        include_presence_percent: true,
        presence_percent: Number(participant.presence ?? 0),
      });

      const safeNumber = participant.certificate_number?.trim() || `certificado-${participationId}`;
      const url = window.URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);

      setCertificateMessage({
        type: "success",
        text: `Certificado ${safeNumber} gerado com sucesso.`,
      });
    } catch (error: any) {
      let apiMessage = error?.response?.data?.message;

      if (!apiMessage && error?.response?.data instanceof Blob) {
        try {
          const rawBody = await error.response.data.text();
          const parsed = JSON.parse(rawBody);
          apiMessage = parsed?.message;
        } catch {
          apiMessage = undefined;
        }
      }

      setCertificateMessage({
        type: "error",
        text: apiMessage || "Nao foi possivel gerar o certificado.",
      });
    } finally {
      setGeneratingParticipationId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <EmployeeAutocompleteField
          value={current.employee}
          onChange={handleEmployeeChange}
          className="md:col-span-2"
        />

        <div className="w-full">
          <input
            id="certificate_number"
            name="certificate_number"
            type="text"
            value={current.certificate_number}
            onChange={(e) => {
              const value = e.target.value;
              setCurrent((prev) => ({ ...prev, certificate_number: value }));
            }}
            disabled
            aria-label="Numero do certificado"
            aria-invalid={Boolean(fieldErrors.certificate_number)}
            aria-describedby={fieldErrors.certificate_number ? "certificate_number-error" : undefined}
            className="bg-gray-50 border text-sm rounded-lg block w-full p-2.5 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50
              border-gray-300"
          />
          {fieldErrors.certificate_number && (
            <p id="certificate_number-error" className="text-red-600 text-sm mt-1">
              {fieldErrors.certificate_number}
            </p>
          )}
        </div>
      </div>

      {fieldErrors.employee && <p className="text-sm text-red-600">{fieldErrors.employee}</p>}

      <FormInput
        id="presence"
        name="presence"
        label="Presenca (%)"
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
        label="Avaliacao"
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
                <th className="px-4 py-2">Numero do certificado</th>
                <th className="px-4 py-2">Presenca</th>
                <th className="px-4 py-2">Avaliacao</th>
                <th className="px-4 py-2">Emitir certificado</th>
                <th className="px-4 py-2 text-center">Acao</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((participant, index) => {
                const absoluteIndex = (currentPage - 1) * perPage + index;
                const participationId =
                  participant.id !== undefined && participant.id !== null
                    ? Number(participant.id)
                    : null;
                const canGenerate =
                  eventId > 0 &&
                  participationId !== null &&
                  !Number.isNaN(participationId) &&
                  Boolean(participant.certificate_number?.trim()) &&
                  participant.emitir_certificado !== false;
                const isGenerating =
                  participationId !== null && generatingParticipationId === participationId;

                return (
                  <tr key={`${participant.employee_id}-${absoluteIndex}`} className="border-b">
                    <td className="px-4 py-2">{participant.employee?.name}</td>
                    <td className="px-4 py-2">
                      {canGenerate ? (
                        <button
                          type="button"
                          onClick={() => handleGenerateCertificate(participant)}
                          disabled={isGenerating}
                          className="text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                          title="Gerar certificado"
                        >
                          {isGenerating ? "Gerando..." : participant.certificate_number}
                        </button>
                      ) : (
                        <span className="text-gray-500">{participant.certificate_number}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{formatPresence(Number(participant.presence ?? 0))}</td>
                    <td className="px-4 py-2">{participant.evaluation || ""}</td>
                    <td className="px-4 py-2">{participant.emitir_certificado ? "Sim" : "Nao"}</td>
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

      {certificateMessage && (
        <p className={`text-sm ${certificateMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {certificateMessage.text}
        </p>
      )}
    </div>
  );
}
