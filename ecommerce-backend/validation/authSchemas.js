// const { z } = require("zod");

// // Signup validation schema
// const signupSchema = z
//   .object({
//     name: z.string().min(1, "Please enter your name"),
//     email: z
//       .string()
//       .min(1, "Please enter your email")
//       .email("Please enter a valid email"),
//     password: z.string().min(6, "Password must be at least 6 characters"),
//     confirmPassword: z
//       .string()
//       .min(1, "Please confirm your password"),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   });

// // Login validation schema
// const loginSchema = z.object({
//   email: z
//     .string()
//     .min(1, "Please enter your email")
//     .email("Please enter a valid email"),
//   password: z.string().min(6, "Password should be at least 6 characters"),
// });

// module.exports = {
//   signupSchema,
//   loginSchema,
// };


const { z } = require("zod");

// Signup validation schema
const signupSchema = z
  .object({
    name: z.string().min(1, "Please enter your name"),
    email: z
      .string()
      .min(1, "Please enter your email")
      .email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    role: z.enum(["admin", "user"]).optional(), // Allow role field for admin dashboard signups
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Login validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email"),
  password: z.string().min(6, "Password should be at least 6 characters"),
});

module.exports = {
  signupSchema,
  loginSchema,
};

