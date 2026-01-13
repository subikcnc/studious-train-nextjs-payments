"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";

declare global {
  interface Window {
    KhaltiCheckout: any;
  }
}

const KhaltiForm = () => {
  const [checkoutReady, setCheckoutReady] = useState(false);

  useEffect(() => {
    // 1️⃣ Dynamically load Khalti checkout script
    const script = document.createElement("script");
    script.src = "https://khalti.com/static/khalti-checkout.js";
    script.async = true;
    script.onload = () => setCheckoutReady(true); // script loaded
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleClick = () => {
    if (!window.KhaltiCheckout) {
      console.error("KhaltiCheckout is not loaded yet");
      return;
    }

    const config = {
      publicKey: process.env.NEXT_PUBLIC_KHALTI_KEY!,
      productIdentity: "123456",
      productName: "Test Product",
      productUrl: "http://localhost:3000",
      eventHandler: {
        onSuccess: async function (payload: any) {
          console.log("Khalti payment success payload:", payload);

          const res = await fetch("/api/khalti-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          console.log("Verification result:", data);
        },
        onError: function (error: any) {
          console.error("Khalti payment error", error);
        },
        onClose: function () {
          console.log("Payment widget closed");
        },
      },
      paymentPreference: ["KHALTI"],
    };

    const checkout = new window.KhaltiCheckout(config);
    checkout.show({ amount: 500 * 100 }); // amount in paisa (NPR * 100)
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={!checkoutReady}>
      Pay via Khalti
    </Button>
  );
};

export default KhaltiForm;
