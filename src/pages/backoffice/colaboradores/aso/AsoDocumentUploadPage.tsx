import { EmployeeDocumentUploadPageView } from "../employeedocuments/EmployeeDocumentUploadPage";

export default function AsoDocumentUploadPage() {
  return (
    <EmployeeDocumentUploadPageView
      title="ASO"
      breadcrumbLabel="ASO"
      breadcrumbTo="/backoffice/aso"
      createUrl="/backoffice/aso/novo"
      editUrlBase="/backoffice/aso/editar"
      deleteTitle="Excluir ASO"
      searchSuffix="ASO"
    />
  );
}
