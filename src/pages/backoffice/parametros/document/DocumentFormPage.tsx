// src/pages/backoffice/parametros/documents/DocumentFormPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import { FormActions } from "../../../../components/form/FormActions";
import {
  getDocumentById,
  createDocument,
  updateDocument,
  type DocumentCategory,
} from "../../../../services/documentService";
import { getDocumentTypes } from "../../../../services/documentTypeService";
import { getDocumentIssuers } from "../../../../services/documentIssuerService";
import FormSelectField from "../../../../components/form/FormSelectField";

export default function DocumentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    category: "general" as DocumentCategory,
    is_required: false,
    validity_days: undefined,
    document_type_id: "",
    document_issuer_id: "",
  });

  const [types, setTypes] = useState<any[]>([]);
  const [issuers, setIssuers] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  useEffect(() => {
    Promise.all([getDocumentTypes(), getDocumentIssuers()]).then(([typeData, issuerData]) => {
      setTypes(typeData.data || []);
      setIssuers(issuerData.data || []);
    });

    if (isEdit) {
      getDocumentById(id!)
        .then(setForm)
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar documento.", type: "error" });
          navigate("/backoffice/documentos");
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = {
        ...form,
        validity_days: form.validity_days === "" ? null : Number(form.validity_days),
        document_type_id: Number(form.document_type_id),
        document_issuer_id: Number(form.document_issuer_id),
      };
      if (isEdit) {
        await updateDocument(id!, payload);
      } else {
        await createDocument(payload);
      }
      setToast({ open: true, message: `Documento ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/documentos");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar documento.", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Documentos", to: "/backoffice/documentos" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Documento" : "Novo Documento"}</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 grid gap-6 md:grid-cols-2">
        <FormInput label="Código" name="code" value={form.code} onChange={handleChange} error={errors.code} required />
        <FormInput label="Nome" name="name" value={form.name} onChange={handleChange} error={errors.name} required />

        <FormTextArea label="Descrição" name="description" value={form.description} onChange={handleChange} error={errors.description} className="md:col-span-2" />

        <FormSelectField label="Categoria" name="category" value={form.category} onChange={handleChange} error={errors.category} options={[
          { value: "employee", label: "Funcionário" },
          { value: "company", label: "Empresa" },
          { value: "general", label: "Geral" },
        ]} />

        <FormInput label="Obrigatório" name="is_required" type="checkbox" checked={form.is_required} onChange={handleChange} error={errors.is_required} />

        <FormInput label="Dias de Validade" name="validity_days" value={form.validity_days ?? ''} onChange={handleChange} error={errors.validity_days} type="number" />

        <FormSelectField label="Tipo de Documento" name="document_type_id" value={form.document_type_id} onChange={handleChange} error={errors.document_type_id} options={types.map((t) => ({ value: t.id, label: t.name }))} />

        <FormSelectField label="Órgão Emissor" name="document_issuer_id" value={form.document_issuer_id} onChange={handleChange} error={errors.document_issuer_id} options={issuers.map((i) => ({ value: i.id, label: i.name }))} />

        <div className="md:col-span-2">
          <FormActions cancelUrl="/backoffice/documentos" text={isEdit ? "Atualizar" : "Criar"} />
        </div>
      </form>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
