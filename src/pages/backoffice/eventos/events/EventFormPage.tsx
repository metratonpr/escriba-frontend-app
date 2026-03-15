import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
import { FormInput } from "../../../../components/form/FormInput";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import { FormActions } from "../../../../components/form/FormActions";
import Toast from "../../../../components/Layout/Feedback/Toast";
import EventTypeAutocompleteField from "../../../../components/form/EventTypeAutocompleteField";
import { createEvent, getEventById, updateEvent } from "../../../../services/eventService";
import { getEventTypes } from "../../../../services/eventTypeService";
import FormParticipantsTable from "../../../../components/form/FormParticipantsTable";
import EventAttendanceByDay from "../../../../components/form/EventAttendanceByDay";
import type { Participant } from "../../../../types/participant";

type EventFormTab = "details" | "participants" | "attendance";

export default function EventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    event_type_id: "",
    total_hours: "",
    start_date: "",
    end_date: "",
    location: "",
    responsible: "",
    speakers: "",
    target_audience: "",
    notes: "",
    participants: [] as Participant[],
  });

  const [eventTypeOption, setEventTypeOption] = useState<{
    id: string | number;
    label: string;
  } | null>(null);
  const [eventTypeOptions, setEventTypeOptions] = useState<
    { id: string | number; label: string }[]
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EventFormTab>("details");

  useEffect(() => {
    let active = true;

    const loadForm = async () => {
      setIsLoading(true);

      try {
        const [eventTypesResponse, eventData] = await Promise.all([
          getEventTypes({ page: 1, perPage: 100 }),
          isEdit && id ? getEventById(id) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        setEventTypeOptions(
          eventTypesResponse.data.map((item) => ({
            id: item.id,
            label: item.nome_tipo_evento,
          }))
        );

        if (eventData) {
          setForm({
            name: eventData.name || "",
            event_type_id: String(eventData.event_type_id),
            total_hours: eventData.total_hours != null ? String(eventData.total_hours) : "",
            start_date: eventData.start_date || "",
            end_date: eventData.end_date || "",
            location: eventData.location || "",
            responsible: eventData.responsible || "",
            speakers: eventData.speakers || "",
            target_audience: eventData.target_audience || "",
            notes: eventData.notes || "",
            participants: (eventData.participations || []).map((participant: Participant) => ({
              id: participant.id,
              event_id: Number(participant.event_id),
              employee_id: Number(participant.employee_id),
              certificate_number: participant.certificate_number,
              presence: Number(participant.presence ?? 0),
              evaluation: participant.evaluation || "",
              emitir_certificado:
                participant.emitir_certificado === undefined
                  ? true
                  : Boolean(participant.emitir_certificado),
              employee: participant.employee
                ? { id: Number(participant.employee.id), name: participant.employee.name }
                : undefined,
            })),
          });

          if (eventData.event_type) {
            setEventTypeOption({
              id: eventData.event_type.id,
              label: eventData.event_type.nome_tipo_evento,
            });
          }
        }
      } catch {
        setToast({ open: true, message: "Erro ao carregar evento.", type: "error" });
        if (isEdit) {
          navigate("/backoffice/eventos");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadForm();

    return () => {
      active = false;
    };
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const parsedTotalHours =
        form.total_hours.trim() === "" ? null : Number.parseFloat(form.total_hours);
      const participantsPayload = form.participants.map((participant) => ({
        ...participant,
        emitir_certificado: participant.emitir_certificado !== false,
      }));

      const payload = {
        ...form,
        participants: participantsPayload,
        total_hours: Number.isNaN(parsedTotalHours) ? null : parsedTotalHours,
        event_type_id: String(eventTypeOption?.id || form.event_type_id),
      };

      if (isEdit) {
        await updateEvent(id!, payload);
      } else {
        await createEvent(payload);
      }

      setToast({
        open: true,
        message: `Evento ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });
      navigate("/backoffice/eventos");
    } catch (err: unknown) {
      const backendErrors =
        (err as { response?: { data?: { errors?: Record<string, string> } } }).response
          ?.data?.errors ?? {};
      setErrors(backendErrors);

      const hasParticipantErrors = Object.keys(backendErrors).some(
        (field) => field === "participants" || field.startsWith("participants.")
      );
      const hasEventFieldErrors = Object.keys(backendErrors).some(
        (field) => !field.startsWith("participants")
      );

      if (hasEventFieldErrors) {
        setActiveTab("details");
      } else if (hasParticipantErrors) {
        setActiveTab("participants");
      }

      setToast({ open: true, message: "Erro ao salvar evento.", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Eventos", to: "/backoffice/eventos" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Evento" : "Novo Evento"}</h1>

      {isLoading ? (
        <FormPageSkeleton className="px-0" fields={10} />
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "details"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Dados
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("participants")}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "participants"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Participantes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("attendance")}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "attendance"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Lista de presença
              </button>
            </nav>
          </div>

          {activeTab === "details" ? (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <FormInput
                    label="Nome"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormInput
                      label="Carga horária (h)"
                      name="total_hours"
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.total_hours}
                      onChange={handleChange}
                      error={errors.total_hours}
                    />
                    <FormDatePickerField
                      label="Data de início"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      error={errors.start_date}
                    />
                    <FormDatePickerField
                      label="Data de término"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      error={errors.end_date}
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <EventTypeAutocompleteField
                    value={eventTypeOption}
                    onChange={setEventTypeOption}
                    error={errors.event_type_id}
                    initialOptions={eventTypeOptions}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput
                  label="Local"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  error={errors.location}
                />
                <FormInput
                  label="Responsável"
                  name="responsible"
                  value={form.responsible}
                  onChange={handleChange}
                  error={errors.responsible}
                />
              </div>

              <FormTextArea
                label="Palestrantes"
                name="speakers"
                value={form.speakers}
                onChange={handleChange}
                error={errors.speakers}
              />
              <FormTextArea
                label="Público-alvo"
                name="target_audience"
                value={form.target_audience}
                onChange={handleChange}
                error={errors.target_audience}
              />
              <FormTextArea
                label="Observações"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                error={errors.notes}
              />
            </>
          ) : activeTab === "participants" ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Participantes</h2>
              <FormParticipantsTable
                eventId={Number(id) || 0}
                participants={form.participants}
                onChange={(list) => setForm((prev) => ({ ...prev, participants: list }))}
                error={errors.participants}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Lista de presença por dia</h2>
              <EventAttendanceByDay
                eventId={isEdit ? Number(id) : undefined}
                startDate={form.start_date}
                endDate={form.end_date}
                participants={form.participants}
              />
            </div>
          )}

          <FormActions
            onCancel={() => navigate("/backoffice/eventos")}
            text={isEdit ? "Atualizar" : "Criar"}
          />
        </form>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
