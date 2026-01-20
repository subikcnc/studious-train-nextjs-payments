"use client";

import { useState } from "react";
import { Button } from "../ui/button";

const EsewaForm = () => {
  const [txnId, setTxnId] = useState<string>("txn_0015");
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
          transaction_uuid: txnId,
          product_code: "EPAYTEST",
          tax_amount: "0",
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
          failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/failure`,
        }),
      });
      const data = await res.json();
      setTxnId((prev) => `txn_${parseInt(prev.split("_")[1]) + 1}`);
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

/*
{
    "order": {
        "code": "OC-S-1768454959",
        "sub_total": "668.01",
        "discount_amount": "0.00",
        "delivery_charge": "0",
        "total": "668.01",
        "status": "Pending",
        "payment_status": "Due",
        "ordered_at": "2026-01-15 11:14:19",
        "store_items": [
            {
                "id": 206,
                "store_name": "Anta Store",
                "slug": "anta-store",
                "delivery_charge": "0.00",
                "sub_total": "668.01",
                "total": "668.01",
                "store_order_code": "OC-S-1768454959-1",
                "current_status": "Pending",
                "products": [
                    {
                        "id": 240,
                        "slug": "joma-adjustable-baseball-cap-1749011428",
                        "name": "joma adjustable baseball cap",
                        "category": "Footwear",
                        "sku": "S-000006",
                        "size": null,
                        "color": null,
                        "quantity": 1,
                        "regular_rate": "668.01",
                        "final_rate": "668.01",
                        "regular_price": "668.01",
                        "final_price": "668.01",
                        "thumbnail": "http://192.168.10.3:8000/storage/product/j-1766383397.jpg",
                        "current_status": "Pending",
                        "is_cancelable": true
                    }
                ]
            }
        ],
        "payment_type": "E Sewa",
        "billing_address": {
            "full_name": "Lenish Magar",
            "address_line_1": "Patan",
            "phone_number": "9999999999",
            "city": "Lalitpur",
            "country": "Nepal",
            "region": "Bagmati Province",
            "area": "Patan"
        },
        "shipping_address": {
            "full_name": "Lenish Magar",
            "address_line_1": "Patan",
            "phone_number": "9999999999",
            "city": "Lalitpur",
            "country": "Nepal",
            "region": "Bagmati Province",
            "area": "Patan"
        }
    },
    "payment": {
        "success": true,
        "payment_url": "https://uat.esewa.com.np/epay/main",
        "payment_data": {
            "amt": "668.01",
            "psc": 0,
            "pdc": 0,
            "txAmt": 0,
            "tAmt": "668.01",
            "pid": "OC-S-1768454959",
            "scd": "epay_payment",
            "su": "http://192.168.10.3:8000/api/v1/payment/esewa/success",
            "fu": "http://192.168.10.3:8000/api/v1/payment/esewa/failure",
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": "KARZQFpKO5l/g8QP+NivJPB4tv9OXcFs7dp7oeq6IV8="
        },
        "transaction_id": 6
    }
}
*/
