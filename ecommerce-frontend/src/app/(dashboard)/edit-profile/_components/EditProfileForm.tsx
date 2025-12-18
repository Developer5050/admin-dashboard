"use client";

import { useTransition, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/shared/form/FormSubmitButton";
import {
  FormTextInput,
  FormImageInput,
  FormReadonly,
} from "@/components/shared/form";

import { profileFormSchema, ProfileFormData } from "./schema";
import { objectToFormData } from "@/helpers/objectToFormData";
import { User } from "@/helpers/getUser";
import { editProfile } from "@/actions/profile/editProfile";

export default function EditProfileForm({ profile }: { profile: User }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const imageDropzoneRef = useRef<HTMLDivElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? "",
      image: profile.image_url ?? undefined,
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    const formData = objectToFormData(data);

    startTransition(async () => {
      const result = await editProfile(profile.id, formData);

      if ("validationErrors" in result) {
        Object.keys(result.validationErrors).forEach((key) => {
          form.setError(key as keyof ProfileFormData, {
            message: result.validationErrors![key],
          });
        });
      } else if ("dbError" in result) {
        toast.error(result.dbError);
      } else {
        toast.success("Profile updated successfully!", {
          position: "top-center",
          description: "Redirecting to dashboard...",
        });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        setIsSuccess(true);
      }
    });
  };

  const onInvalid = (errors: FieldErrors<ProfileFormData>) => {
    if (errors.image) {
      imageDropzoneRef.current?.focus();
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  return (
    <Card className="mb-5 p-6 md:px-8 md:py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <div className="space-y-6">
            <FormImageInput
              control={form.control}
              name="image"
              label="Profile Picture"
              previewImage={profile.image_url ?? undefined}
              required
              ref={imageDropzoneRef}
            />

            <FormTextInput
              control={form.control}
              name="name"
              label="Name"
              placeholder="Your name"
            />

            <FormReadonly label="Email" value={profile.email} />

            <FormTextInput
              control={form.control}
              name="phone"
              label="Contact Number"
              placeholder="Your number"
            />
          </div>

          <div className="flex justify-end mt-10">
            <FormSubmitButton isPending={isPending}>
              Update Profile
            </FormSubmitButton>
          </div>
        </form>
      </Form>
    </Card>
  );
}
