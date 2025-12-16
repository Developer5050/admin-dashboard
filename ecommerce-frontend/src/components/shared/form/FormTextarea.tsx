import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

type FormTextareaProps<TFormData extends FieldValues> = {
  control: Control<TFormData>;
  name: Path<TFormData>;
  label: string;
  placeholder: string;
  required?: boolean;
};

function FormTextarea<TFormData extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required,
}: FormTextareaProps<TFormData>) {
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
              <Textarea className="h-32" placeholder={placeholder} {...field} />
            </FormControl>

            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

export default FormTextarea;
