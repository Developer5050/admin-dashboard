"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

import {
  FormSheetContent,
  FormSheetBody,
  FormSheetHeader,
  FormSheetFooter,
} from "@/components/shared/form/FormSheet";
import {
  FormTextInput,
  FormImageInput,
  FormSlugInput,
  FormTextarea,
} from "@/components/shared/form";
import { FormSubmitButton } from "@/components/shared/form/FormSubmitButton";
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

import { categoryFormSchema, CategoryFormData } from "./schema";
import { objectToFormData } from "@/helpers/objectToFormData";
import { CategoryServerActionResponse } from "@/types/server-action";

type BaseCategoryFormProps = {
  title: string;
  description: string;
  submitButtonText: string;
  actionVerb: string;
  children: React.ReactNode;
  action: (formData: FormData) => Promise<CategoryServerActionResponse>;
};

type AddCategoryFormProps = BaseCategoryFormProps & {
  initialData?: never;
  previewImage?: never;
};

type EditCategoryFormProps = BaseCategoryFormProps & {
  initialData: Partial<CategoryFormData>;
  previewImage: string;
};

type CategoryFormProps = AddCategoryFormProps | EditCategoryFormProps;

export default function CategoryFormSheet({
  title,
  description,
  submitButtonText,
  actionVerb,
  initialData,
  previewImage,
  children,
  action,
}: CategoryFormProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const imageDropzoneRef = useRef<HTMLDivElement>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
      slug: "",
      status: "active" as "active" | "inactive",
      ...initialData,
    },
  });

  useEffect(() => {
    form.reset(initialData);
  }, [form, initialData]);

  const onSubmit = (data: CategoryFormData) => {
    const formData = objectToFormData(data);

    startTransition(async () => {
      const result = await action(formData);

      if ("validationErrors" in result) {
        Object.keys(result.validationErrors).forEach((key) => {
          form.setError(key as keyof CategoryFormData, {
            message: result.validationErrors![key],
          });
        });

        form.setFocus(
          Object.keys(result.validationErrors)[0] as keyof CategoryFormData
        );
      } else if ("dbError" in result) {
        toast.error(result.dbError);
      } else {
        form.reset();
        toast.success(
          `Category "${result.category.name}" ${actionVerb} successfully!`,
          { position: "top-center" }
        );
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsSheetOpen(false);
      }
    });
  };

  const onInvalid = (errors: FieldErrors<CategoryFormData>) => {
    if (errors.image) {
      imageDropzoneRef.current?.focus();
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      {children}

      <SheetContent className="w-[90%] max-w-5xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="size-full"
          >
            <FormSheetContent>
              <FormSheetHeader>
                <div className="flex flex-col">
                  <SheetTitle>{title}</SheetTitle>
                  <SheetDescription>{description}</SheetDescription>
                </div>
              </FormSheetHeader>

              <FormSheetBody>
                <div className="space-y-6">
                  <FormTextInput
                    control={form.control}
                    name="name"
                    label="Category Name"
                    placeholder="Category Name / Title"
                    required
                  />

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Category Description"
                    placeholder="Category Description"
                    required
                  />

                  <FormImageInput
                    control={form.control}
                    name="image"
                    label="Category Image"
                    previewImage={previewImage}
                    ref={imageDropzoneRef}
                    required
                  />

                  <FormSlugInput
                    form={form}
                    control={form.control}
                    name="slug"
                    label="Category Slug"
                    placeholder="Category Slug"
                    generateSlugFrom="name"
                    required
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-col md:flex-row md:gap-x-4 md:space-y-0">
                        <FormLabel className="md:flex-shrink-0 md:w-1/4 md:mt-2 leading-snug">
                          Status
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="space-y-2 w-full">
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                          >
                            <FormControl>
                              <SelectTrigger className="md:basis-1/5">
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </FormSheetBody>

              <FormSheetFooter>
                <FormSubmitButton isPending={isPending} className="w-full">
                  {submitButtonText}
                </FormSubmitButton>
              </FormSheetFooter>
            </FormSheetContent>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
