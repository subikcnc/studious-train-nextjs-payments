import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Here the pidx is sent from the client
  const { pidx } = await request.json();

  try {
    // Hit the khalti verify api endpoint
    const response = await fetch(
      `${process.env.KHALTI_API_VERIFICATION_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${process.env.KHALTI_API_SECRET_KEY}`,
        },
        body: JSON.stringify({ pidx }),
      }
    );

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
