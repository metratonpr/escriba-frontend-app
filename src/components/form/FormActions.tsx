interface FormActionsProps {
  onCancel: () => void;
  text?: string;
  isSubmitting?: boolean;
  disableSubmit?: boolean;
}

export const FormActions = ({
  onCancel,
  text = "Salvar",
  isSubmitting = false,
  disableSubmit = false,
}: FormActionsProps) => (
  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
    <button
      type="submit"
      disabled={disableSubmit || isSubmitting}
      aria-label={text}
      className="w-full md:w-auto text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {isSubmitting ? "Salvando..." : text}
    </button>
    <button
      type="button"
      onClick={onCancel}
      aria-label="Cancelar formulário"
      className="w-full md:w-auto text-white bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      Cancelar
    </button>
  </div>
);
