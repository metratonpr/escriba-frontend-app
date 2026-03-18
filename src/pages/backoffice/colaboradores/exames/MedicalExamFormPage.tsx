import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createMedicalExam,
  getMedicalExamById,
  updateMedicalExam,
} from "../../../../services/medicalExamService";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
import FormSelectField from "../../../../components/form/FormSelectField";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import { FormInput } from "../../../../components/form/FormInput";
import FormSwitchField from "../../../../components/form/FormSwitchField";
import { FormActions } from "../../../../components/form/FormActions";
import FileViewer from "../../../../components/Layout/FileViewer";
import Toast from "../../../../components/Layout/Feedback/Toast";
import EmployeeAutocompleteField from "../../../../components/form/EmployeeAutocompleteField";
import TechnicianAutocompleteField from "../../../../components/form/TechnicianAutocompleteField";
import FileUpload from "../../../../components/form/FileUpload";
import ExamAttachmentList from "./ExamAttachmentList";
import { getFieldError } from "../../../../utils/errorUtils";
import { getEmployees } from "../../../../services/employeeService";

export type UploadFile =
  | File
  | {
    id: number;
    upload_id?: number | null;
    nome_arquivo: string;
    url_arquivo: string;
    has_file?: boolean | null;
    links?: {
      view?: string;
      download?: string;
    };
  };

type SelectedAttachment = {
  fileId: number;
  fileName: string;
  viewUrl: string | null;
  downloadUrl: string | null;
};

export default function MedicalExamFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employee_id: "",
    technician_id: "",
    exam_type: "",
    exam_date: "",
    cid: "",
    fit: false,
    cost: "",
    paid_by_company: false,
    result_attachment_url: "",
    documents: [] as UploadFile[],
  });

  const [deletedUploadIds, setDeletedUploadIds] = useState<number[]>([]);
  const [employeeSelected, setEmployeeSelected] = useState<{ id: string | number; label: string } | null>(null);
  const [technicianSelected, setTechnicianSelected] = useState<{ id: string | number; label: string } | null>(null);
  const [employeeOptions, setEmployeeOptions] = useState<{ id: string | number; label: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({ open: false, message: "", type: "success" });
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<SelectedAttachment | null>(null);

  useEffect(() => {
    let active = true;

    const loadForm = async () => {
      setIsInitializing(true);

      try {
        const [employeesResponse, examResponse] = await Promise.all([
          getEmployees({ page: 1, perPage: 100 }),
          isEdit && id ? getMedicalExamById(Number(id)) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        setEmployeeOptions(
          employeesResponse.data.map((item) => ({ id: item.id, label: item.name }))
        );

        if (examResponse) {
          setForm({
            employee_id: String(examResponse.employee_id),
            technician_id: examResponse.technician_id ? String(examResponse.technician_id) : "",
            exam_type: examResponse.exam_type,
            exam_date: examResponse.exam_date?.slice(0, 10),
            cid: examResponse.cid || "",
            fit: !!examResponse.fit,
            cost:
              examResponse.cost === null || examResponse.cost === undefined
                ? ""
                : String(examResponse.cost),
            paid_by_company: !!examResponse.paid_by_company,
            result_attachment_url: examResponse.result_attachment_url || "",
            documents: examResponse.uploads?.map((upload) => ({
              id: upload.id,
              upload_id: upload.upload_id,
              nome_arquivo: upload.nome_arquivo,
              url_arquivo: upload.url_arquivo,
              has_file: upload.has_file,
              links: {
                view: upload.links?.view ?? undefined,
                download: upload.links?.download ?? undefined,
              },
            })) || [],
          });

          setEmployeeSelected({
            id: examResponse.employee_id,
            label: examResponse.employee?.name || examResponse.employee_name || "Colaborador",
          });

          setTechnicianSelected(
            examResponse.technician_id && examResponse.technician?.name
              ? {
                  id: examResponse.technician_id,
                  label: examResponse.technician.name,
                }
              : null
          );
        }
      } catch {
        setToast({ open: true, message: "Erro ao carregar exame", type: "error" });
        if (isEdit) {
          navigate("/backoffice/exames-medicos");
        }
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    };

    void loadForm();

    return () => {
      active = false;
    };
  }, [id, isEdit, navigate]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.append("employee_id", form.employee_id);
    formData.append("technician_id", form.technician_id);
    formData.append("exam_type", form.exam_type);
    formData.append("exam_date", form.exam_date);
    formData.append("cid", form.cid ?? "");
    formData.append("fit", form.fit ? "1" : "0");
    formData.append("cost", form.cost ?? "");
    formData.append("paid_by_company", form.paid_by_company ? "1" : "0");
    formData.append("result_attachment_url", form.result_attachment_url ?? "");

    form.documents.forEach((doc) => {
      if (doc instanceof File) {
        formData.append("documents[]", doc);
      }
    });

    deletedUploadIds.forEach((id) => {
      formData.append("documents_to_delete[]", String(id));
    });

    try {
      if (isEdit) {
        formData.append("_method", "PUT");
        await updateMedicalExam(Number(id), formData);
      } else {
        await createMedicalExam(formData);
      }

      setToast({
        open: true,
        message: `Exame ${isEdit ? "atualizado" : "criado"} com sucesso`,
        type: "success",
      });

      navigate("/backoffice/exames-medicos");
    } catch (err: any) {
      setErrors(err.response?.data?.errors || {});
      setToast({
        open: true,
        message: "Erro ao salvar exame",
        type: "error",
      });
    }
  };

  const handleRemoveFile = (index: number, type: 'persisted' | 'pending') => {
    if (type === 'persisted') {
      const doc = form.documents.filter((d) => !(d instanceof File))[index] as any;
      setDeletedUploadIds((prev) => [...prev, doc.id]);
      setForm((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => !(d instanceof File) ? d.id !== doc.id : true),
      }));
    } else {
      const pendingDocs = form.documents.filter((d) => d instanceof File);
      const docToRemove = pendingDocs[index];
      setForm((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d !== docToRemove),
      }));
    }
  };

  const persisted = form.documents.filter((d): d is Exclude<UploadFile, File> => !(d instanceof File));
  const pending = form.documents.filter((d): d is File => d instanceof File);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Backoffice", to: "/backoffice" },
          { label: "Exames Médicos", to: "/backoffice/exames-medicos" },
          { label: isEdit ? "Editar" : "Novo" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Exame Médico" : "Novo Exame Médico"}</h1>

      {isInitializing ? (
        <FormPageSkeleton className="px-0" fields={8} />
      ) : (
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
        <EmployeeAutocompleteField
          value={employeeSelected}
          error={getFieldError(errors, "employee_id")}
          initialOptions={employeeOptions}
          onChange={(opt) => {
            setEmployeeSelected(opt);
            setForm((prev) => ({ ...prev, employee_id: String(opt?.id || "") }));
          }}
        />

        <TechnicianAutocompleteField
          label="Tecnico em Seguranca do Trabalho"
          value={technicianSelected}
          onChange={(opt) => {
            setTechnicianSelected(opt);
            setForm((prev) => ({ ...prev, technician_id: String(opt?.id || "") }));
          }}
          error={getFieldError(errors, "technician_id")}
          required
        />


        <FormSelectField
          label="Tipo de Exame"
          name="exam_type"
          value={form.exam_type}
          onChange={handleChange}
          options={[
            { value: "admissional", label: "Admissional" },
            { value: "periodico", label: "Periódico" },
            { value: "demissional", label: "Demissional" },
            { value: "retorno_ao_trabalho", label: "Retorno ao Trabalho" },
            { value: "mudanca_de_funcao", label: "Mudança de Função" },
          ]}
          error={errors.exam_type}
        />

        <FormDatePickerField
          label="Data do Exame"
          name="exam_date"
          value={form.exam_date}
          onChange={handleChange}
          error={errors.exam_date}
        />

        <FormInput id="cid" name="cid" label="CID" value={form.cid} onChange={handleChange} error={errors.cid} />

        <FormInput
          id="cost"
          name="cost"
          type="number"
          step="0.01"
          min="0"
          label="Custo"
          value={form.cost}
          onChange={handleChange}
          error={errors.cost}
        />

        <FormSwitchField
          label="Apto"
          name="fit"
          checked={form.fit}
          onChange={handleChange}
          error={getFieldError(errors, "fit")}
        />

        <FormSwitchField
          label="Pago pela empresa"
          name="paid_by_company"
          checked={form.paid_by_company}
          onChange={handleChange}
          error={getFieldError(errors, "paid_by_company")}
        />

        <FormInput
          id="result_attachment_url"
          name="result_attachment_url"
          label="Link do Resultado"
          value={form.result_attachment_url}
          onChange={handleChange}
          error={errors.result_attachment_url}
        />

        <FileUpload
          label="Anexos do Exame"
          files={form.documents}
          setFiles={(files) => setForm((prev) => ({ ...prev, documents: files }))}
          showToast={(msg, type) => setToast({ open: true, message: msg, type: type === "error" ? "error" : "success" })}
          error={getFieldError(errors, "documents", "upload", "result_attachment")}
        />

        <ExamAttachmentList
          examId={id || ""}
          persisted={persisted}
          pending={pending}
          onRemove={handleRemoveFile}
          onViewAttachment={(attachment) =>
            setSelectedAttachment({
              fileId: Number(attachment.upload_id ?? attachment.id),
              fileName: attachment.nome_arquivo,
              viewUrl: attachment.links?.view ?? null,
              downloadUrl: attachment.links?.download ?? null,
            })
          }
        />

        <FormActions onCancel={() => navigate("/backoffice/exames-medicos")} text={isEdit ? "Atualizar" : "Criar"} />
      </form>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <Transition appear show={selectedAttachment !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedAttachment(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <Dialog.Title className="sr-only">
                    {selectedAttachment?.fileName ?? "Visualizar arquivo"}
                  </Dialog.Title>

                  {selectedAttachment && (
                    <FileViewer
                      embedded
                      fileId={selectedAttachment.fileId}
                      fileName={selectedAttachment.fileName}
                      viewUrl={selectedAttachment.viewUrl}
                      downloadUrl={selectedAttachment.downloadUrl}
                      onClose={() => setSelectedAttachment(null)}
                    />
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
