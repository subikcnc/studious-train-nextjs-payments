import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { transaction_uuid } = await request.json();

  const esewaCheckResponse = await fetch(
    `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=500&transaction_uuid=${transaction_uuid}`,
  );
  const esewaCheckData = await esewaCheckResponse.json();
  console.log("status of esewa check data", esewaCheckData, transaction_uuid);

  return NextResponse.json({
    status: 200,
    body: esewaCheckData,
  });
}
