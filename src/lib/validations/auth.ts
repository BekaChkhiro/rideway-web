import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'ელ-ფოსტა აუცილებელია')
    .email('არასწორი ელ-ფოსტის ფორმატი'),
  password: z.string().min(1, 'პაროლი აუცილებელია'),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'ელ-ფოსტა აუცილებელია')
      .email('არასწორი ელ-ფოსტის ფორმატი'),
    username: z
      .string()
      .min(3, 'მომხმარებლის სახელი მინიმუმ 3 სიმბოლო')
      .max(30, 'მომხმარებლის სახელი მაქსიმუმ 30 სიმბოლო')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'მხოლოდ ლათინური ასოები, ციფრები და _'
      ),
    fullName: z
      .string()
      .min(2, 'სახელი მინიმუმ 2 სიმბოლო')
      .max(100, 'სახელი მაქსიმუმ 100 სიმბოლო'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[0-9]{9,15}$/.test(val),
        'არასწორი ტელეფონის ფორმატი'
      ),
    password: z
      .string()
      .min(8, 'პაროლი მინიმუმ 8 სიმბოლო')
      .regex(/[A-Z]/, 'პაროლი უნდა შეიცავდეს დიდ ასოს')
      .regex(/[a-z]/, 'პაროლი უნდა შეიცავდეს პატარა ასოს')
      .regex(/[0-9]/, 'პაროლი უნდა შეიცავდეს ციფრს'),
    confirmPassword: z.string().min(1, 'გაიმეორეთ პაროლი'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'პაროლები არ ემთხვევა',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'კოდი უნდა იყოს 6 ციფრი')
    .regex(/^\d+$/, 'მხოლოდ ციფრები'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'ელ-ფოსტა აუცილებელია')
    .email('არასწორი ელ-ფოსტის ფორმატი'),
});

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .length(6, 'კოდი უნდა იყოს 6 ციფრი')
      .regex(/^\d+$/, 'მხოლოდ ციფრები'),
    newPassword: z
      .string()
      .min(8, 'პაროლი მინიმუმ 8 სიმბოლო')
      .regex(/[A-Z]/, 'პაროლი უნდა შეიცავდეს დიდ ასოს')
      .regex(/[a-z]/, 'პაროლი უნდა შეიცავდეს პატარა ასოს')
      .regex(/[0-9]/, 'პაროლი უნდა შეიცავდეს ციფრს'),
    confirmPassword: z.string().min(1, 'გაიმეორეთ პაროლი'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'პაროლები არ ემთხვევა',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
