import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import { FormInput } from "../../../../components/form/FormInput";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import { FormActions } from "../../../../components/form/FormActions";
import Toast from "../../../../components/Layout/Feedback/Toast";
import EventTypeAutocompleteField from "../../../../components/form/EventTypeAutocompleteField";
import { createEvent, getEventById, updateEvent } from "../../../../services/eventService";
import FormParticipantsTable from "../../../../components/form/FormParticipantsTable";
import type { Participant } from "../../../../types/participant";

type EventFormTab = "details" | "participants";

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
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<EventFormTab>("details");

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    setIsLoading(true);
    getEventById(id!)
      .then((data) => {
        setForm({
          name: data.name || "",
          event_type_id: String(data.event_type_id),
          total_hours: data.total_hours != null ? String(data.total_hours) : "",
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          location: data.location || "",
          responsible: data.responsible || "",
          speakers: data.speakers || "",
          target_audience: data.target_audience || "",
          notes: data.notes || "",
          participants: (data.participations || []).map((p: any) => ({
            id: p.id,
            event_id: Number(p.event_id),
            employee_id: Number(p.employee_id),
            certificate_number: p.certificate_number,
            presence: !!p.presence,
            evaluation: p.evaluation || "",
            employee: p.employee ? { id: Number(p.employee.id), name: p.employee.name } : undefined,
          })),
        });

        if (data.event_type) {
          setEventTypeOption({
            id: data.event_type.id,
            label: data.event_type.nome_tipo_evento,
          });
        }
      })
      .catch(() => {
        setToast({ open: true, message: "Erro ao carregar evento.", type: "error" });
        navigate("/backoffice/eventos");
      })
      .finally(() => setIsLoading(false));
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
        form.total_hours.trim() === "" ? null : Number.parseInt(form.total_hours, 10);

      const payload = {
        ...form,
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
    } catch (err: any) {
      const backendErrors = err.response?.data?.errors ?? {};
      setErrors(backendErrors);

      const hasEventFieldErrors = Object.keys(backendErrors).some(
        (field) => field !== "participants"
      );

      if (hasEventFieldErrors) {
        setActiveTab("details");
      } else if (backendErrors.participants) {
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

      {isEdit && isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
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
                      step={1}
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
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Participantes</h2>
              <FormParticipantsTable
                eventId={Number(id) || 0}
                participants={form.participants}
                onChange={(list) => setForm((prev) => ({ ...prev, participants: list }))}
                error={errors.participants}
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
