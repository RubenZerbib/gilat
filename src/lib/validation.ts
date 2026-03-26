import { z } from "zod";
import { MEDICAL_QUESTIONS } from "@/config/pdf-mapping";

const questionSchema = z.record(
  z.string(),
  z.boolean({ required_error: "יש לענות על כל השאלות" })
);

export const formSchema = z.object({
  fullName: z
    .string()
    .min(2, "שם מלא חייב להכיל לפחות 2 תווים")
    .max(100, "שם מלא ארוך מדי"),
  idNumber: z
    .string()
    .regex(/^\d{9}$/, "תעודת זהות חייבת להכיל 9 ספרות"),
  medicalAnswers: questionSchema.refine(
    (answers) => {
      return MEDICAL_QUESTIONS.every((q) => typeof answers[q.id] === "boolean");
    },
    { message: "יש לענות על כל השאלות הרפואיות" }
  ),
  medications: z.string(),
  allergies: z.string(),
  additionalNotes: z.string(),
  signature: z
    .string()
    .min(1, "חתימה נדרשת"),
});

export type FormData = z.infer<typeof formSchema>;

export const adminLoginSchema = z.object({
  username: z.string().min(1, "שם משתמש נדרש"),
  password: z.string().min(1, "סיסמה נדרשת"),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;
