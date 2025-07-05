import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeAutocompleteField from "../../../../components/form/EmployeeAutocompleteField";
import DocumentWithVersionField from "../../../../components/form/DocumentWithVersionField";
import { FormActions } from "../../../../components/form/FormActions";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import Spinner from "../../../../components/Layout/ui/Spinner";


interface Option {
  id: string | number;
  label: string;
}

export default function MedicalExamFormPage() {
  const navigate = useNavigate();

  const [selectedEmployee, setSelectedEmployee] = useState<Option | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Option | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) {
      setToast({ open: true, message: "Selecione um funcionário.", type: "error" });
      return;
    }

    if (!selectedDocument) {
      setToast({ open: true, message: "Selecione um documento.", type: "error" });
      return;
    }

    setIsLoading(true);
    // Simula processamento
    setTimeout(() => {
      console.log({
        funcionario: selectedEmployee,
        documento: selectedDocument,
        versao: selectedVersionId,
      });

      setToast({ open: true, message: "Formulário salvo com sucesso!", type: "success" });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Exames Médicos", to: "/backoffice/exames-medicos" },
          { label: "Novo", to: "#" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">Novo Exame Médico</h1>

      {isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <EmployeeAutocompleteField
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            error={!selectedEmployee ? "Obrigatório" : undefined}
          />

          <DocumentWithVersionField
            document={selectedDocument}
            onDocumentChange={(doc) => {
              setSelectedDocument(doc);
              setSelectedVersionId("");
            }}
            versionId={selectedVersionId}
            onVersionChange={(e) => setSelectedVersionId(e.target.value)}
          />

          <FormActions
            loading={isLoading}
            onCancel={() => navigate("/backoffice/exames-medicos")}
            text="Salvar"
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
