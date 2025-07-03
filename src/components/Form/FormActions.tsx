interface FormActionsProps {
  onCancel: () => void;
  isEdit?: boolean;
}

const FormActions = ({ onCancel, isEdit = false }: FormActionsProps) => (
  <div className="flex items-center justify-between">
    <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">
      {isEdit ? "Atualizar" : "Criar"}
    </button>
    <button type="button" onClick={onCancel} className="ml-4 text-sm font-medium text-gray-700 hover:underline dark:text-gray-300">
      Cancelar
    </button>
  </div>
);
