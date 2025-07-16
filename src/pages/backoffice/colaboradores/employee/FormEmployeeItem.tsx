import FormSelectField from "../../../../components/form/FormSelectField";
import { FormInput } from "../../../../components/form/FormInput";
import FormAutocompleteField from "../../../../components/form/FormAutocompleteField";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "date" | "select" | "autocomplete";
  options?: { value: string; label: string }[];
}

interface FormEmployeeItemProps {
  label: string;
  name: string;
  items: any[];
  onChange: (index: number, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  fields: FieldConfig[];
  errorMap?: Record<string, string>;
}

export const FormEmployeeItem = ({
  label,
  name,
  items,
  onChange,
  onAdd,
  onRemove,
  fields,
  errorMap = {},
}: FormEmployeeItemProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mt-6 mb-2">{label}</h2>

      {items.map((item, index) => {
        const topFields = fields.filter(f => f.name === "id" || f.name === "status");
        const bottomFields = fields.filter(f => f.name === "start_date" || f.name === "end_date");

        return (
          <div key={index} className="mb-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {topFields.map((field) => {
                const fieldName = `${name}[${index}].${field.name}`;
                const value = item[field.name] ?? "";

                const baseProps = {
                  key: field.name,
                  name: fieldName,
                  label: field.label,
                  value,
                  error: errorMap[fieldName],
                  required: field.name !== "end_date",
                  className: "w-full",
                };

                let FieldComponent;

                switch (field.type) {
                  case "select":
                    FieldComponent = (
                      <FormSelectField
                        {...baseProps}
                        onChange={(e) => onChange(index, field.name, e.target.value)}
                        options={field.options || []}
                      />
                    );
                    break;
                  case "autocomplete":
                    FieldComponent = (
                      <FormAutocompleteField
                        {...baseProps}
                        onChange={(val) => onChange(index, field.name, val)}
                        options={(field.options || []).map(({ value, label }) => ({ id: value, label }))}
                      />
                    );
                    break;
                  default:
                    FieldComponent = (
                      <FormInput
                        {...baseProps}
                        id={`${name}-${index}-${field.name}`}
                        type={field.type}
                        onChange={(e) => onChange(index, field.name, e.target.value)}
                      />
                    );
                    break;
                }

                return (
                  <div key={field.name} className="w-full flex flex-col justify-end">
                    {FieldComponent}
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {bottomFields.map((field) => {
                const fieldName = `${name}[${index}].${field.name}`;
                const value = item[field.name] ?? "";

                const baseProps = {
                  key: field.name,
                  name: fieldName,
                  label: field.label,
                  value,
                  error: errorMap[fieldName],
                  required: field.name !== "end_date",
                  className: "w-full",
                };

                return (
                  <div key={field.name} className="w-full flex flex-col justify-end">
                    <FormInput
                      {...baseProps}
                      id={`${name}-${index}-${field.name}`}
                      type={field.type}
                      onChange={(e) => onChange(index, field.name, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="w-full flex items-end justify-end">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-600 text-sm"
              >
                Remover
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="text-blue-600 text-sm mb-4"
      >
        + Adicionar {label.toLowerCase()}
      </button>
    </div>
  );
};
