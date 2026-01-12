import CryptoJS from "crypto-js";
import { NextResponse } from "next/server";

export async function GET() {
  const secret = process.env.ESEWA_SECRET_KEY;

  if (!secret) {
    console.error("ESEWA_SECRET_KEY is not defined");
    return NextResponse.json(
      { error: "ESEWA_SECRET_KEY is not defined" },
      { status: 500 }
    );
  }

  console.log("this is the secret key", secret);

  return NextResponse.json({ message: "Get successfull" });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Fields that you are signing
  const signedFields = ["total_amount", "transaction_uuid", "product_code"];
  const secret = process.env.ESEWA_SECRET_KEY;

  if (!secret) {
    console.error("ESEWA_SECRET_KEY is not defined");
    return NextResponse.json(
      { error: "ESEWA_SECRET_KEY is not defined" },
      { status: 500 }
    );
  }

  // Concatenate fields in order: total_amount=VAL,transaction_uuid=VAL,product_code=VAL
  const message = `total_amount=${body.total_amount},transaction_uuid=${body.transaction_uuid},product_code=${body.product_code}`;
  console.log("concatenated message", message);

  // Generate HMAC-SHA256
  const hash = CryptoJS.HmacSHA256(message, secret);
  console.log("Hash generation success", hash);

  // Convert to Base64
  const signature = CryptoJS.enc.Base64.stringify(hash);
  console.log("Signature generation success", signature);

  return NextResponse.json({
    ...body,
    signature,
    signed_field_names: signedFields.join(","),
  });
}
