import { forwardRef, Ref, useEffect, useState, useMemo } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { MultipleImagesDropzone } from "@/components/shared/MultipleImagesDropzone";

type FormMultipleImagesInputProps<TFormData extends FieldValues> = {
  control: Control<TFormData>;
  name: Path<TFormData>;
  label: string;
  previewImages?: string[];
  required?: boolean;
};

type MultipleImagesInputContentProps = {
  field: { value: (File | string)[] | undefined; onChange: (value: (File | string)[] | undefined) => void };
  previewImages?: string[];
  label: string;
  required?: boolean;
};

// Internal component that manages state and hooks
const MultipleImagesInputContent = forwardRef<HTMLDivElement, MultipleImagesInputContentProps>(
  function MultipleImagesInputContent({ field, previewImages, label, required }, forwardedRef) {
  // Convert field value to array format
  const currentValue = useMemo<(File | string)[]>(() => {
    if (Array.isArray(field.value)) {
      return field.value;
    }
    return field.value ? [field.value] : [];
  }, [field.value]);
  
  // Track blob URLs for File objects
  const [blobUrlMap, setBlobUrlMap] = useState<Map<File, string>>(new Map());

  // Generate preview URLs
  const previewUrls = useMemo<string[]>(() => {
    // Use previewImages if provided
    if (previewImages && previewImages.length > 0) {
      const filePreviews: string[] = [];
      currentValue.forEach(item => {
        if (item instanceof File) {
          let blobUrl = blobUrlMap.get(item);
          if (!blobUrl) {
            blobUrl = URL.createObjectURL(item);
            setBlobUrlMap(prev => new Map(prev).set(item, blobUrl!));
          }
          filePreviews.push(blobUrl);
        }
      });
      const existingUrls = new Set(previewImages);
      const additionalFilePreviews = filePreviews.filter(url => !existingUrls.has(url));
      return [...previewImages, ...additionalFilePreviews];
    }
    
    // Generate from currentValue
    return currentValue.map(item => {
      if (item instanceof File) {
        let blobUrl = blobUrlMap.get(item);
        if (!blobUrl) {
          blobUrl = URL.createObjectURL(item);
          setBlobUrlMap(prev => new Map(prev).set(item, blobUrl!));
        }
        return blobUrl;
      }
      return item;
    });
  }, [previewImages, currentValue, blobUrlMap]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlMap.forEach(url => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [blobUrlMap]);

  const handleFilesAccepted = (files: File[]) => {
    if (files.length > 0) {
      // Merge new files with existing images
      const existingUrls = currentValue.filter((v): v is string => typeof v === "string");
      const existingFiles = currentValue.filter((v): v is File => v instanceof File);
      const updated = [...existingUrls, ...existingFiles, ...files];
      field.onChange(updated.length > 0 ? updated : undefined);
    }
  };

  const handleFileRemoved = (index: number) => {
    const itemToRemove = currentValue[index];
    // Clean up blob URL if it's a File
    if (itemToRemove instanceof File) {
      const blobUrl = blobUrlMap.get(itemToRemove);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrlMap(prev => {
          const updated = new Map(prev);
          updated.delete(itemToRemove);
          return updated;
        });
      }
    }
    const updated = currentValue.filter((_, i) => i !== index);
    field.onChange(updated.length > 0 ? updated : undefined);
  };

  return (
    <FormItem className="flex flex-col md:flex-row md:gap-x-4 md:space-y-0">
      <FormLabel className="md:flex-shrink-0 md:w-1/4 md:mt-2 leading-snug">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>

      <div className="space-y-2 w-full">
        <FormControl>
          <MultipleImagesDropzone
            ref={forwardedRef}
            previewImages={previewUrls}
            onFilesAccepted={handleFilesAccepted}
            onFileRemoved={handleFileRemoved}
          />
        </FormControl>

        <FormMessage />
      </div>
    </FormItem>
  );
  }
);

const FormMultipleImagesInput = forwardRef(function FormMultipleImagesInputRender<
  TFormData extends FieldValues
>(
  { control, name, label, previewImages, required }: FormMultipleImagesInputProps<TFormData>,
  ref: Ref<HTMLDivElement>
) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <MultipleImagesInputContent
          ref={ref}
          field={field}
          previewImages={previewImages}
          label={label}
          required={required}
        />
      )}
    />
  );
}) as <TFormData extends FieldValues>(
  props: FormMultipleImagesInputProps<TFormData> & { ref?: Ref<HTMLDivElement> }
) => React.ReactElement;

export default FormMultipleImagesInput;
