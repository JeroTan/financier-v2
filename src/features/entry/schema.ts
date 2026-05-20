import { z } from "zod";

export const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) return false;
      if (num <= 0) return false;
      if (num > 999999999) return false;
      const decimals = val.includes(".") ? val.split(".")[1]?.length ?? 0 : 0;
      if (decimals > 2) return false;
      return true;
    }, "Enter a valid positive amount (max 2 decimals)"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (d > today) return false;
      return true;
    }, "Date must be today or earlier"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  receiptUrl: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
