interface FormActionsProps {
  onCancel: () => void;
  text?: string;
}

export const FormActions = ({ onCancel, text = "Salvar" }: FormActionsProps) => (
  <div className="flex items-center justify-between">
    <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">
      {text}
    </button>
    <button type="button" onClick={onCancel} className="text-white bg-gray-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">
      Cancelar
    </button>
  </div>
);
