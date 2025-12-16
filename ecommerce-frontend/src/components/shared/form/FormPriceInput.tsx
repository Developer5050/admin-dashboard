import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type FormPriceInputProps<TFormData extends FieldValues> = {
  control: Control<TFormData>;
  name: Path<TFormData>;
  label: string;
  placeholder: string;
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
};

function FormPriceInput<TFormData extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required,
  minValue,
  maxValue,
  step,
}: FormPriceInputProps<TFormData>) {
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
              <div className="relative">
                <div className="absolute top-0 left-0 border-r border-r-input px-3 h-12 w-10 grid place-items-center text-lg rounded-l-md">
                  <span>$</span>
                </div>

                <Input
                  type="number"
                  className="h-12 pl-14"
                  min={minValue ?? 0}
                  max={maxValue}
                  step={step}
                  onFocus={(e) => e.target.select()}
                  placeholder={placeholder}
                  {...field}
                  onChange={(e) => {
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
                  }}
                  onKeyDown={(e) => {
                    // Prevent minus key
                    if (e.key === "-" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </FormControl>

            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

export default FormPriceInput;
