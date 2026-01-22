"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const KhaltiForm = () => {
  const router = useRouter();
  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/khalti-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url: "http://localhost:3000/khalti-success",
          website_url: "http://localhost:3000",
          amount: 15500, // Amount is in paisa
          purchase_order_id: "txn009",
          purchase_order_name: "Skechers key chain",
          customer_info: {
            name: "Khalti Bahadur",
            email: "bahadurKhalti@example.com",
            phone: "9800000000",
          },
          amount_breakdown: [
            {
              label: "Mark Price",
              amount: 5000 * 3,
            },
            {
              label: "VAT",
              amount: 500,
            },
          ],
          product_details: [
            {
              identity: "123456",
              name: "Skechers key chain",
              total_price: 5000 * 3,
              quantity: 3,
              unit_price: 5000,
            },
          ],
          merchant_username: "merchant_name",
          merchant_extra: "merchant_extra",
        }),
      });
      const data = await response.json();

      //   We assume everything goes     right so we proceed
      console.log(data);
      const { pidx, payment_url } = data;

      router.push(payment_url);
    } catch (error) {
      console.error("Error occured when making payment", error);
    }
  };
  return (
    <Button variant="outline" onClick={handleSubmit}>
      Pay with Khalti
    </Button>
  );
};

export default KhaltiForm;

// Note
/*
Response from khalti is in format
{
  pidx: 'q7HtaKPGnUhymdjZAmJMxD',
  payment_url: 'https://test-pay.khalti.com/?pidx=q7HtaKPGnUhymdjZAmJMxD',
  expires_at: '2026-01-13T12:14:12.907466+05:45',
  expires_in: 1800
}
As soon as you get back this response from khalti, this means the payment is success, you can view in the dashboard in khalti
*/
