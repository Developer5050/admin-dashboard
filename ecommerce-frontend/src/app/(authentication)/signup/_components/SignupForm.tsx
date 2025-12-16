"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Typography from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSubmitButton } from "@/components/shared/form/FormSubmitButton";

import { signupFields } from "./fields";
import { signupFormSchema } from "./schema";
import AuthProviders from "@/components/shared/auth/AuthProviders";
import { EyeOff, Eye } from 'lucide-react';


type FormData = z.infer<typeof signupFormSchema>;

export default function SignupForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (formData: FormData) => {
      await axios.post("/auth/sign-up", formData);
      return formData; // Return formData to access email in onSuccess
    },
    onSuccess: (formData) => {
      toast.success("Signup Success!", {
        description:
          "Account created successfully. Redirecting to login page...",
        position: "top-center",
      });

      form.reset();
      
      // Store email before redirect for autofill on login page
      const email = formData.email;
      
      // Add a small delay to ensure toast message is visible before redirect
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }, 1500);
      
      // Don't invalidate user-profile query here - user is not logged in yet
      // Token is cleared after signup, so /auth/me would fail with 401
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const { errors } = error.response?.data;

        for (const key in errors) {
          if (errors[key]) {
            form.setError(key as keyof FormData, {
              message: errors[key],
            });
          }
        }
      } else {
        console.error(error);
      }
    },
  });

  const onSubmit = (formData: FormData) => {
    mutate(formData);
  };


  return (
    <div className="w-full">
      <Typography variant="h2" className="mb-8">
        Create an Account
      </Typography>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {signupFields.map((formField) => {
            const isPassword = formField.name === "password";
            const isConfirmPassword = formField.name === "confirmPassword";
            const shouldShowPassword = isPassword ? showPassword : isConfirmPassword ? showConfirmPassword : false;
            const togglePassword = isPassword 
              ? () => setShowPassword(!showPassword)
              : isConfirmPassword 
              ? () => setShowConfirmPassword(!showConfirmPassword)
              : () => {};

            return (
              <FormField
                key={`form-field-${formField.name}`}
                control={form.control}
                name={formField.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formField.label}</FormLabel>
                    <FormControl>
                      {(isPassword || isConfirmPassword) ? (
                        <div className="relative">
                          <Input
                            type={shouldShowPassword ? "text" : "password"}
                            placeholder={formField.placeholder}
                            autoComplete={formField.autoComplete}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {shouldShowPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <Input
                          type={formField.inputType}
                          placeholder={formField.placeholder}
                          autoComplete={formField.autoComplete}
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}

          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>

                  <FormLabel className="!m-0">
                    I agree to the{" "}
                    <Typography
                      variant="a"
                      href="#"
                      className="md:!text-sm font-medium"
                    >
                      privacy policy
                    </Typography>
                  </FormLabel>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormSubmitButton isPending={isPending} className="w-full">
            Create account
          </FormSubmitButton>
        </form>
      </Form>

      <Separator className="my-12" />
      <AuthProviders authType="Signup" />

      <div>
        <Typography variant="a" href="/login" className="md:!text-sm">
          Already have an account? Login
        </Typography>
      </div>
    </div>
  );
}
