"use client";

import { Button } from "../ui/button";

const HblForm = () => {
  const handleSubmit = async () => {
    const response = await fetch("/api/hbl-pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: "500",
        currency: "NPR",
        invoice_no: `INV_${Date.now()}`,
        frontend_return_url: "http://localhost:3000/hbl-success",
        backend_return_url: "http://localhost:3000/api/2c2p/callback",
      }),
    });
    const data = await response.json();
    console.log("Response data for hbl payment", data);
  };
  return (
    <Button onClick={handleSubmit} variant="outline">
      Pay with HBL
    </Button>
  );
};

export default HblForm;
