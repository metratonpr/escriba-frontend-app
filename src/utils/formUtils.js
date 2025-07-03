/**
 * Atualiza o estado do formulário com base em inputs padrão (TextField etc.)
 */
export const handleInputChange = (setValues) => (e) => {
  const { name, value } = e.target;
  setValues((prev) => ({ ...prev, [name]: value }));
};

/**
 * Atualiza campos de autocomplete ou similares.
 * Ex: onChange={handleAutocompleteChange(setValues, 'customer_id')}
 */
export const handleAutocompleteChange = (setValues, field) => (_, newValue) => {
  setValues((prev) => ({ ...prev, [field]: newValue }));
};

/**
 * Extrai mensagens de erro do backend (Laravel validation errors)
 */
export const extractErrors = (errorResponse) => {
  if (errorResponse?.response?.data?.errors) {
    return errorResponse.response.data.errors;
  }
  return {};
};

/**
 * Formata datas para input tipo date (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return dateString.substring(0, 10);
};
