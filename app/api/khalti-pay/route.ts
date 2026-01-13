import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Request body is", body);

  try {
    //   Make POST request to khalti endpoint
    const response = await fetch(`${process.env.KHALTI_API_ENDPOINT}`, {
      method: "POST",
      headers: {
        Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Response from khalti is is", data);

    return NextResponse.json({
      ...body,
      ...data,
      message: "Payment may be successful",
    });
  } catch (error) {
    return NextResponse.json({
      error: "Something went wrong",
      status: 500,
    });
  }
}

// 1. Client hits this api with all the data
// 2. We make a POST request to khalti API
// 3. If success, we get the payment_url and pidx
// 4. We redirect the client to payment_url from the client side
// 5. After client makes the payment,the success response is obtained in the return URL specified during payment initiate.

/*
This is the sample success response
http://example.com/?pidx=bZQLD9wRVWo4CdESSfuSsB - Initial payment identifier
&txnId=4H7AhoXDJWg5WjrcPT9ixW - Transaction ID
&amount=1000 - Amount in paisa
&total_amount=1000 - Same value as amount
&status=Completed - Enum which is either Completed, Pending or User Canceled
&mobile=98XXXXX904 - Mobile number of the user
&tidx=4H7AhoXDJWg5WjrcPT9ixW - Same value Transaction ID
&purchase_order_id=test12 -  The initial purchase_order_id provided during payment initiate
&purchase_order_name=test -  The initial purchase_order_name provided during payment initiate
&transaction_id=4H7AhoXDJWg5WjrcPT9ixW - Transaction ID

/khalti-success?pidx=eye5p7QdgaQMJzHcHakkMT&transaction_id=2WNvUfyRSdmCSDXv9QUwEo&tidx=2WNvUfyRSdmCSDXv9QUwEo&txnId=2WNvUfyRSdmCSDXv9QUwEo&amount=5500&total_amount=5500&mobile=98XXXXX005&status=Completed&purchase_order_id=txn001&purchase_order_name=Anta+KT9+Basketball+shoes

- After this there is no further step to complete the payment, however merchant can process with their own validation and confirmation steps
- Recommended is to check the payment lookup API for confirmation after the redirect callback is received
*/
