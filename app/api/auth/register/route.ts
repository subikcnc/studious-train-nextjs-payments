import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    console.log("name, email, pass in route", name, email, password);
    return NextResponse.json({ message: "hey" });
  } catch (error) {
    console.error("Registration failed", error);
  }
}
