import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/jwt";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const payload = await verifyToken(token);
    return NextResponse.json({ payload }, { status: 200 });
  } catch (error) {
    console.error("Error verifying token", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
