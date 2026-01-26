"use server";

import { cookies } from "next/headers";
import { verifyToken } from "../utils/jwt";
import { NextResponse } from "next/server";
import db from "@/db";
import { accounts } from "@/db/schema";

export const getUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accountToken")?.value;
    if (!token) {
      throw new Error("Unauthorized");
    }
    const payload = await verifyToken(token);
    return NextResponse.json(
      { email: payload.email, username: payload.username },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying token", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
};

export const getAllUsers = async () => {
  try {
    // const users
    const users = await db
      .select({ id: accounts.id, name: accounts.name, email: accounts.email })
      .from(accounts);
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error getting all users", error);
    return NextResponse.json(
      { error: "Error getting all users" },
      { status: 500 },
    );
  }
};
