import z from "zod";

export const esewaPaySchema = z.object({
  amount: z.string().min(1, { message: "Amount is required" }),
  transaction_uuid: z
    .string()
    .min(1, { message: "Transaction ID is required" }),
  tax_amount: z.string().min(1, { message: "Tax amount is required" }),
  product_code: z.string().min(1, { message: "Product code is required" }),
  total_amount: z.string().min(1, { message: "Total amount is required" }),
  product_service_charge: z
    .string()
    .min(1, { message: "Product service charge is required" }),
  product_delivery_charge: z
    .string()
    .min(1, { message: "Product delivery charge is required" }),
  success_url: z.string().min(1, { message: "Success URL is required" }),
  failure_url: z.string().min(1, { message: "Failure URL is required" }),
  signed_field_names: z
    .string()
    .min(1, { message: "Signed field names is required" }),
  signature: z.string().min(1, { message: "Signature is required" }),
});
