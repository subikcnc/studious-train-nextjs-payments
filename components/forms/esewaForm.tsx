"use client";

import { Button } from "../ui/button";

const EsewaForm = () => {
  const handleSubmit = async () => {
    try {
      // Call backend to get signed payload
      const res = await fetch("/api/esewa-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "500",
          total_amount: "500",
          transaction_uuid: "txn_0004",
          product_code: "EPAYTEST",
          tax_amount: "0",
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: "http://localhost:3000/success",
          failure_url: "http://localhost:3000/failure",
        }),
      });
      const data = await res.json();
      console.log("Signed message", data.message);
      console.log("Signature", data.signature);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      // sandbox endpoint

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  return (
    <Button variant="outline" onClick={() => handleSubmit()}>
      Pay with Esewa
    </Button>
  );
};

export default EsewaForm;
