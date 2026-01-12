"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const EsewaSuccessPage = () => {
  const [status, setStatus] = useState<string>("Verifying...");
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  console.log("!!!Data in client component!!!", data);

  useEffect(() => {
    if (!data) return;
    const verifyResponse = async () => {
      try {
        const response = await fetch("/api/esewa-verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        });
        const responseData = await response.json();
        console.log("Response data is ", responseData);
        if (responseData.success) {
          setStatus("Payment Successfull");
        } else {
          setStatus("Payment Failed");
        }
      } catch (error) {
        console.error("Some weird error occured", error);
        setStatus("Something went wrong");
      }
    };

    verifyResponse();
  }, [data]);
  return <div>{status}</div>;
};

export default EsewaSuccessPage;
