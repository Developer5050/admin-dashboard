"use client";

import { forwardRef, Ref } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormStatusInputProps<TFormData extends FieldValues> = {
  control: Control<TFormData>;
  name: Path<TFormData>;
  label: string;
  container?: HTMLDivElement;
  required?: boolean;
};

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "selling", label: "Selling" },
  { value: "out of stock", label: "Out of Stock" },
];

const FormStatusInput = forwardRef(function FormStatusInputRender<
  TFormData extends FieldValues
>(
  { control, name, label, container, required }: FormStatusInputProps<TFormData>,
  ref: Ref<HTMLButtonElement>
) {
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
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <FormControl>
                <SelectTrigger ref={ref} className="md:basis-1/5">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
              </FormControl>

              <SelectContent portalContainer={container}>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}) as <TFormData extends FieldValues>(
  props: FormStatusInputProps<TFormData> & { ref?: Ref<HTMLButtonElement> }
) => React.ReactElement;

export default FormStatusInput;

