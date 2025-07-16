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


export default function EventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    event_type_id: "",
    start_date: "",
    end_date: "",
    location: "",
    responsible: "",
    speakers: "",
    target_audience: "",
    notes: "",
    participants: [] as Participant[],
  });

  const [eventTypeOption, setEventTypeOption] = useState<{ id: string | number; label: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setIsLoading(true);
      getEventById(id!)
        .then((data) => {
          setForm({
            name: data.name || "",
            event_type_id: String(data.event_type_id),
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
            setEventTypeOption({ id: data.event_type.id, label: data.event_type.nome_tipo_evento });
          }
        })
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar evento.", type: "error" });
          navigate("/backoffice/eventos");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = {
        ...form,
        event_type_id: String(eventTypeOption?.id || form.event_type_id),
      };
      if (isEdit) {
        await updateEvent(id!, payload);
      } else {
        await createEvent(payload);
      }
      setToast({ open: true, message: `Evento ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/eventos");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar evento.", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs items={[
        { label: "Parâmetros", to: "/backoffice/parametros" },
        { label: "Eventos", to: "/backoffice/eventos" },
        { label: isEdit ? "Editar" : "Novo", to: "#" },
      ]} />

      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Evento" : "Novo Evento"}</h1>

      {isEdit && isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Nome" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
            <EventTypeAutocompleteField value={eventTypeOption} onChange={setEventTypeOption} />
            <FormDatePickerField label="Data de Início" name="start_date" value={form.start_date} onChange={handleChange} error={errors.start_date} />
            <FormDatePickerField label="Data de Término" name="end_date" value={form.end_date} onChange={handleChange} error={errors.end_date} />
            <FormInput label="Local" name="location" value={form.location} onChange={handleChange} error={errors.location} />
            <FormInput label="Responsável" name="responsible" value={form.responsible} onChange={handleChange} error={errors.responsible} />
          </div>

          <FormTextArea label="Palestrantes" name="speakers" value={form.speakers} onChange={handleChange} error={errors.speakers} />
          <FormTextArea label="Público-alvo" name="target_audience" value={form.target_audience} onChange={handleChange} error={errors.target_audience} />
          <FormTextArea label="Observações" name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />

          <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-semibold mb-2">Participantes</h2>
            <FormParticipantsTable
              eventId={Number(id) || 0}
              participants={form.participants}
              onChange={(list) => setForm((prev) => ({ ...prev, participants: list }))}
              error={errors.participants}
            />
          </div>

          <FormActions onCancel={() => navigate("/backoffice/eventos")} text={isEdit ? "Atualizar" : "Criar"} />
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
