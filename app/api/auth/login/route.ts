import db from "@/db";
import { accounts } from "@/db/schema";
import { generateToken } from "@/lib/utils/jwt";
import { comparePassword } from "@/lib/utils/passwords";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log("email, password in route", email, password);
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, email));
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    const isPasswordValid = await comparePassword(password, account.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }
    const token = await generateToken({
      id: account.id,
      email: account.email,
      username: account.name,
    });
    return NextResponse.json(
      {
        message: "Login successful",
        account,
        token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login failed", error);
    NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
