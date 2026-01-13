"use client";
import { useEffect } from "react";

export const useKhaltiCheckout = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_KHALTI_SCRIPT_ENDPOINT!;
    script.async = true;
    document.body.appendChild(script);
  }, []);
};
