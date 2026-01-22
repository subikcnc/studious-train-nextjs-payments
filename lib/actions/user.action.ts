"use server";

import { cookies } from "next/headers";
import { verifyToken } from "../utils/jwt";
import { NextResponse } from "next/server";

export const getUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accountToken")?.value;
    if (!token) {
      throw new Error("Unauthorized");
    }
    const payload = await verifyToken(token);
    return NextResponse.json({ payload }, { status: 200 });
  } catch (error) {
    console.error("Error verifying token", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
};
