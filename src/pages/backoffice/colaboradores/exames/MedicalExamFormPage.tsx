// src/pages/backoffice/exames/MedicalExamFormPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormActions } from "../../../../components/form/FormActions";
import FormSelectField from "../../../../components/form/FormSelectField";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import FormSwitchField from "../../../../components/form/FormSwitchField";
import FormAutocompleteField from "../../../../components/form/FormAutocompleteField";
import {
  getMedicalExamById,
  createMedicalExam,
  updateMedicalExam,
} from "../../../../services/medicalExamService";
import { getEmployees } from "../../../../services/employeeService";

const examTypes = [
  { value: "admissional", label: "Admissional" },
  { value: "periodico", label: "Periódico" },
  { value: "demissional", label: "Demissional" },
  { value: "retorno_ao_trabalho", label: "Retorno ao Trabalho" },
  { value: "mudanca_de_funcao", label: "Mudança de Função" },
];

function MedicalExamFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [employees, setEmployees] = useState<{ id: number; label: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; label: string } | null>(null);

  const [form, setForm] = useState({
    employee_id: "",
    exam_type: "",
    exam_date: "",
    cid: "",
    fit: true,
    result_attachment_url: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    getEmployees().then((res) => {
      const data = Array.isArray(res) ? res : res.data;
      const options = data.map((e: any) => ({ id: e.id, label: e.name }));
      setEmployees(options);
    });

    if (isEdit && id) {
      getMedicalExamById(+id)
        .then((data) => {
          setForm({
            employee_id: String(data.employee_id),
            exam_type: data.exam_type,
            exam_date: data.exam_date.slice(0, 10),
            cid: data.cid || "",
            fit: Boolean(data.fit),
            result_attachment_url: data.result_attachment_url || "",
          });
          setSelectedEmployee({
            id: data.employee.id,
            label: data.employee.name,
          });
        })
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar exame.", type: "error" });
          navigate("/backoffice/exames-medicos");
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const totalSize = selected.reduce((sum, f) => sum + f.size, 0);
    const invalid = selected.find((f) => f.size > 20 * 1024 * 1024);

    if (invalid) {
      setFileError(`O arquivo \"${invalid.name}\" excede 20MB.`);
      return;
    }

    if (totalSize > 50 * 1024 * 1024) {
      setFileError("O total dos arquivos não pode ultrapassar 50MB.");
      return;
    }

    setFiles(selected);
    setFileError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!selectedEmployee) {
      validationErrors.employee_id = "Selecione um colaborador";
    }
    if (!form.exam_type) {
      validationErrors.exam_type = "Informe o tipo de exame";
    }
    if (!form.exam_date) {
      validationErrors.exam_date = "Informe a data do exame";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("employee_id", String(selectedEmployee.id));
      formData.append("exam_type", form.exam_type);
      formData.append("exam_date", form.exam_date);
      formData.append("cid", form.cid);
      formData.append("fit", form.fit ? "1" : "0");
      formData.append("result_attachment_url", form.result_attachment_url);

      files.forEach((file) => {
        formData.append("documents[]", file);
      });

      if (isEdit) {
        await updateMedicalExam(Number(id), formData);
      } else {
        await createMedicalExam(formData);
      }

      setToast({
        open: true,
        message: `Exame ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });
      navigate("/backoffice/exames-medicos");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({
        open: true,
        message: "Erro ao salvar exame. Verifique os campos obrigatórios.",
        type: "error",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Exames Médicos", to: "/backoffice/exames-medicos" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Exame Médico" : "Novo Exame Médico"}</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6" encType="multipart/form-data">
        <FormAutocompleteField
          label="Colaborador"
          options={employees}
          value={selectedEmployee}
          onChange={setSelectedEmployee}
          placeholder="Selecione o colaborador"
          className="w-full"
        />
        <FormSelectField
          label="Tipo de Exame"
          name="exam_type"
          value={form.exam_type}
          onChange={handleChange}
          options={examTypes}
          error={errors.exam_type}
          required
        />
        <FormDatePickerField
          label="Data do Exame"
          name="exam_date"
          value={form.exam_date}
          onChange={handleChange}
          error={errors.exam_date}
        />
        <FormInput
          label="CID (opcional)"
          name="cid"
          value={form.cid}
          onChange={handleChange}
          error={errors.cid}
        />
        <FormSwitchField
          label="Apto"
          name="fit"
          checked={form.fit}
          onChange={handleChange}
        />
        <FormInput
          label="URL do Anexo (opcional)"
          name="result_attachment_url"
          value={form.result_attachment_url}
          onChange={handleChange}
          error={errors.result_attachment_url}
          type="url"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documentos (PDF/JPG/PNG até 20MB cada, máx. 50MB)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
        </div>

        <FormActions cancelUrl="/backoffice/exames-medicos" text={isEdit ? "Atualizar" : "Criar"} />
      </form>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}

export default MedicalExamFormPage;