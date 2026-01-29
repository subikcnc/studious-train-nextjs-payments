"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const FailurePage = () => {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_uuid");
  const productCode = searchParams.get("product_code");
  const totalAmount = searchParams.get("total_amount");

  const [data, setData] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(
          `/api/esewa-status-check?transaction_id=${transactionId}&product_code=${productCode}&total_amount=${totalAmount}`,
          {
            method: "POST",
            body: JSON.stringify({
              transaction_uuid: transactionId,
              product_code: productCode,
              total_amount: totalAmount,
            }),
          },
        );
        const data = await res.json();
        console.log("This is the response from nextjs api endpoint", data);
        setData(data);
      } catch (error) {
        console.error("Error checking payment status", error);
      }
    };

    if (transactionId && productCode && totalAmount) {
      checkPaymentStatus();
    }
  }, [transactionId, productCode, totalAmount]);
  return <div>Failure Page {JSON.stringify(data)}</div>;
};

export default FailurePage;
