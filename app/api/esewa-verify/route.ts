import CryptoJS from "crypto-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { data } = await req.json();

  if (!data) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  // 1. Decode the Base64 data
  const decodedData = Buffer.from(data, "base64").toString("utf-8");
  console.log("Decoded data", decodedData);
  const payload = JSON.parse(decodedData);
  console.log("Parsed decoded data", payload);
  //   Decoded data will be in the following format
  /* 
  {"transaction_code":"000DS94","status":"COMPLETE","total_amount":"500.0","transaction_uuid":"txn_0002","product_code":"EPAYTEST","signed_field_names":"transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names","signature":"hvbNBlNoyilGS9nyY9oYF3EWTkAKIGlk36TZHw0gfkk="}
    */

  const secret = process.env.ESEWA_SECRET_KEY;
  const signedFields = payload.signed_field_names.split(",");
  if (!secret) {
    return NextResponse.json(
      { error: "Secret key is not defined" },
      { status: 500 }
    );
  }
  //   Generate the message
  const message = signedFields
    .map((field: string) => `${field}=${payload[field]}`)
    .join(",");

  //   Generate the signature
  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(message, secret)
  );

  //   Then compare the signatures
  if (signature !== payload.signature) {
    return NextResponse.json(
      {
        error: "Signature does not match",
      },
      { status: 400 }
    );
  }

  //   Check payment status
  if (payload.status !== "COMPLETE") {
    return NextResponse.json(
      { error: "Payment is not completed" },
      { status: 400 }
    );
  }

  console.log("Signature", signature);

  return NextResponse.json({
    success: true,
    transaction_uuid: payload.transaction_uuid,
  });
}
