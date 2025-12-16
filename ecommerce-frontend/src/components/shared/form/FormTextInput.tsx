import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type FormTextInputProps<TFormData extends FieldValues> = {
  control: Control<TFormData>;
  name: Path<TFormData>;
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  minValue?: number;
  maxValue?: number;
};

function FormTextInput<TFormData extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type,
  required,
  minValue,
  maxValue,
}: FormTextInputProps<TFormData>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col md:flex-row md:gap-x-4 md:space-y-0">
          <FormLabel className="md:flex-shrink-0 md:w-1/4 md:mt-2 leading-snug">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>

          <div className="space-y-2 w-full">
            <FormControl>
              <Input
                className="h-12"
                type={type}
                placeholder={placeholder}
                min={type === "number" ? (minValue ?? 0) : undefined}
                max={type === "number" ? maxValue : undefined}
                onFocus={
                  type === "number" ? (e) => e.target.select() : undefined
                }
                {...field}
                onChange={(e) => {
                  if (type === "number") {
                    const value = e.target.value;
                    // Allow empty string (for clearing the field)
                    if (value === "") {
                      field.onChange(e);
                      return;
                    }
                    // Prevent negative values - block if contains minus sign
                    if (value.includes("-")) {
                      return;
                    }
                    // Allow valid positive numbers and zero
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      field.onChange(e);
                    }
                  } else {
                    field.onChange(e);
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent minus key and 'e' key for number inputs
                  if (type === "number" && (e.key === "-" || e.key === "e" || e.key === "E")) {
                    e.preventDefault();
                  }
                }}
              />
            </FormControl>

            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

export default FormTextInput;
