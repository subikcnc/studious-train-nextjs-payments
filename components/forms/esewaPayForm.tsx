"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { esewaPaySchema } from "@/lib/validations";
import { Form } from "../ui/form";
import { Button } from "../ui/button";

export function EsewaPayForm() {
  const esewaPayForm = useForm<z.infer<typeof esewaPaySchema>>({
    resolver: zodResolver(esewaPaySchema),
    defaultValues: {
      amount: "100",
      transaction_uuid: "123456",
      tax_amount: "10",
      product_code: "123456",
      total_amount: "110",
      product_service_charge: "10",
      product_delivery_charge: "10",
      success_url: "http://localhost:3000",
      failure_url: "http://localhost:3000",
      signed_field_names: "",
      signature: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof esewaPaySchema>) => {
    console.log("Form submitted with values", values);
  };

  return (
    <Form {...esewaPayForm}>
      <form onSubmit={esewaPayForm.handleSubmit(handleSubmit)}>
        <Button type="submit">Pay via esewa</Button>
      </form>
    </Form>
  );
}

export default EsewaPayForm;
