import CryptoJS from "crypto-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    message: "Payment may be successful",
    body,
  });
}
