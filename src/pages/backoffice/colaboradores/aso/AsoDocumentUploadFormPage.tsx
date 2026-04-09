import { EmployeeDocumentUploadFormPageView } from "../employeedocuments/EmployeeDocumentUploadFormPage";

export default function AsoDocumentUploadFormPage() {
  return (
    <EmployeeDocumentUploadFormPageView
      title="ASO"
      breadcrumbLabel="ASO"
      breadcrumbTo="/backoffice/aso"
      cancelUrl="/backoffice/aso"
      documentSearchSuffix="ASO"
    />
  );
}
