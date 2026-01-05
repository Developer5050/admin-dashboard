"use client";

import { useRef, LegacyRef, useState, useTransition, useEffect } from "react";
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
  FormCategoryInput,
  FormImageInput,
  FormMultipleImagesInput,
  FormPriceInput,
  FormSlugInput,
  FormStatusInput,
  FormTextarea,
} from "@/components/shared/form";
import { FormSubmitButton } from "@/components/shared/form/FormSubmitButton";

import { productFormSchema, ProductFormData } from "./schema";
import { ProductServerActionResponse } from "@/types/server-action";

type BaseProductFormProps = {
  title: string;
  description: string;
  submitButtonText: string;
  actionVerb: string;
  children: React.ReactNode;
  action: (formData: FormData) => Promise<ProductServerActionResponse>;
};

type AddProductFormProps = BaseProductFormProps & {
  initialData?: never;
  previewImage?: never;
  previewMainImage?: never;
};

type EditProductFormProps = BaseProductFormProps & {
  initialData: Partial<ProductFormData>;
  previewImage?: string | string[];
  previewMainImage?: string;
};

type ProductFormProps = AddProductFormProps | EditProductFormProps;

export default function ProductFormSheet({
  title,
  description,
  submitButtonText,
  actionVerb,
  initialData,
  previewImage,
  previewMainImage,
  children,
  action,
}: ProductFormProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [container, setContainer] = useState(null);
  const mainImageDropzoneRef = useRef<HTMLDivElement>(null);
  const multipleImagesDropzoneRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLButtonElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      image: undefined,
      images: undefined,
      sku: "",
      category: "",
      costPrice: 0,
      salesPrice: 0,
      stock: 0,
      minStockThreshold: 0,
      slug: "",
      status: "draft",
      ...initialData,
    },
  });

  useEffect(() => {
    form.reset(initialData);
  }, [form, initialData]);

  const onSubmit = (data: ProductFormData) => {
    const formData = new FormData();
  
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("shortDescription", data.shortDescription);
    formData.append("sku", data.sku);
    formData.append("category", data.category);
    formData.append("costPrice", String(data.costPrice));
  
    // FIXED: must match backend "salesPrice" 
    formData.append("salesPrice", String(data.salesPrice));
  
    formData.append("quantity", String(data.stock));
    formData.append("minStockThreshold", String(data.minStockThreshold));
  
    formData.append("slug", data.slug);
    formData.append("status", data.status);
  
    // Separate existing images (string URLs) from new images (File objects)
    const existingMainImage = data.image && typeof data.image === 'string' ? data.image : null;
    const newMainImage = data.image && data.image instanceof File ? data.image : null;
    
    const existingAdditionalImages: string[] = [];
    const newAdditionalImages: File[] = [];
    
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((image) => {
        if (typeof image === 'string') {
          existingAdditionalImages.push(image);
        } else if (image instanceof File) {
          newAdditionalImages.push(image);
        }
      });
    }
  
    // Send existing main image URL if it exists and no new main image is provided
    if (existingMainImage && !newMainImage) {
      formData.append("existingMainImage", existingMainImage);
    }
    
    // Send existing additional image URLs
    existingAdditionalImages.forEach((imageUrl) => {
      formData.append("existingImages", imageUrl);
    });
  
    // Append new main image as first item in "images" array (backend processes "images" field)
    if (newMainImage) {
      formData.append("images", newMainImage);
    }
  
    // Append new additional images (multiple) - these come after main image
    newAdditionalImages.forEach((image) => {
      formData.append("images", image);
    });
  
    startTransition(async () => {
      const result = await action(formData);
  
      if ("validationErrors" in result) {
        Object.keys(result.validationErrors).forEach((key) => {
          form.setError(key as keyof ProductFormData, {
            message: result.validationErrors![key],
          });
        });
  
        form.setFocus(
          Object.keys(result.validationErrors)[0] as keyof ProductFormData
        );
      } else if ("dbError" in result) {
        toast.error(result.dbError);
      } else {
        form.reset();
        toast.success(
          `Product "${result.product.name}" ${actionVerb} successfully!`,
          { position: "top-center" }
        );
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setIsSheetOpen(false);
      }
    });
  };
  

  const onInvalid = (errors: FieldErrors<ProductFormData>) => {
    if (errors.image) {
      mainImageDropzoneRef.current?.focus();
    } else if (errors.images) {
      multipleImagesDropzoneRef.current?.focus();
    } else if (errors.category) {
      categoryRef.current?.focus();
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
                <div
                  className="space-y-6"
                  ref={setContainer as LegacyRef<HTMLDivElement>}
                >
                  <FormTextInput
                    control={form.control}
                    name="name"
                    label="Product Name"
                    placeholder="Product Name / Title"
                    required
                  />

                  <FormTextInput
                    control={form.control}
                    name="shortDescription"
                    label="Short Description"
                    placeholder="Short description (max 200 characters)"
                    required
                  />

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Product Description"
                    placeholder="Product Description"
                    required
                  />

                  <FormImageInput
                    control={form.control}
                    name="image"
                    label="Main Product Image"
                    previewImage={previewMainImage || (previewImage && !Array.isArray(previewImage) ? previewImage : (Array.isArray(previewImage) ? previewImage[0] : undefined))}
                    ref={mainImageDropzoneRef}
                  />

                  <FormMultipleImagesInput
                    control={form.control}
                    name="images"
                    label="Additional Product Images"
                    previewImages={previewImage && Array.isArray(previewImage) && previewImage.length > 1 ? previewImage.slice(1) : undefined}
                    ref={multipleImagesDropzoneRef}
                  />

                  <FormTextInput
                    control={form.control}
                    name="sku"
                    label="Product SKU"
                    placeholder="Product SKU"
                    required
                  />

                  <FormCategoryInput
                    control={form.control}
                    name="category"
                    label="Category"
                    container={container || undefined}
                    ref={categoryRef}
                    required
                  />

                  <FormStatusInput
                    control={form.control}
                    name="status"
                    label="Status"
                    container={container || undefined}
                    required
                  />

                  <FormPriceInput
                    control={form.control}
                    name="costPrice"
                    label="Cost Price"
                    placeholder="Original Price"
                    required
                    minValue={0}
                  />

                  <FormPriceInput
                    control={form.control}
                    name="salesPrice"
                    label="Sale Price"
                    placeholder="Sale Price"
                    required
                    minValue={0}
                  />

                  <FormTextInput
                    control={form.control}
                    name="stock"
                    label="Product Quantity"
                    placeholder="Product Quantity"
                    type="number"
                    required
                    maxValue={999999}
                  />

                  <FormTextInput
                    control={form.control}
                    name="minStockThreshold"
                    label="Min Stock Threshold"
                    placeholder="Minimum Stock Threshold"
                    type="number"
                    required
                  />

                  <FormSlugInput
                    form={form}
                    control={form.control}
                    name="slug"
                    label="Product Slug"
                    placeholder="Product Slug"
                    generateSlugFrom="name"
                    required
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

