import { SignJWT } from "jose";
import jwt from "jsonwebtoken";
import { createSecretKey } from "node:crypto"; // saying node:crypto means to import crypto from node

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export const verifyToken = (token: string) => {
  try {
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const generateToken = (payload: JwtPayload) => {
  const secret = process.env.JWT_SECRET!;
  const secretKey = createSecretKey(secret, "utf-8");
  // secret key is another level of security that actually is optional
  // creates and returns a new object containing a secret key for symmetric encryption or Hmac
  // Hmac is an algorithm that uses a secret key to generate a message authentication code (MAC)

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) //
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(secretKey);
};

// JWT can be thought of as an object that is converted to a string based off of some algorithm
// so you put some identifying traits on the JwtPayload type to generate the JWT token
