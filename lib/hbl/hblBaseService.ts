import * as jose from "jose";

export interface HblSecurityConfig {
  JWS_ALG: string;
  JWE_ALG: string;
  JWE_ENC: string;
  TOKEN_TYPE: string;
}

// Equivalent to SecurityData.php
export const SECURITY_DATA: HblSecurityConfig = {
  JWS_ALG: "PS256",
  JWE_ALG: "RSA-OAEP",
  JWE_ENC: "A128CBC-HS256",
  TOKEN_TYPE: "JWT",
};

export abstract class HblBaseService {
  protected baseUrl: string;
  protected encryptionId: string;

  constructor() {
    this.baseUrl = process.env.HBL_API_ENDPOINT!;
    this.encryptionId = process.env.HBL_ENCRYPTION_ID!;
  }

  // Imports a PEM private key into a JWK object
  protected async getPrivateKey(
    key: string,
    alg: string = SECURITY_DATA.JWS_ALG
  ): Promise<jose.CryptoKey | Uint8Array> {
    const pem = this.formatPem(key, "PRIVATE KEY");
    const jwk = await jose.importPKCS8(pem, alg);
    return jwk;
  }

  // Imports a PEM public key into a JWK object
  protected async getPublicKey(
    key: string,
    alg: string = SECURITY_DATA.JWS_ALG
  ): Promise<jose.CryptoKey | Uint8Array> {
    const pem = this.formatPem(key, "PUBLIC KEY");
    const jwk = await jose.importSPKI(pem, alg);
    return jwk;
  }

  /**
   * Formats a key string into a proper PEM format with optional headers.
   */
  private formatPem(key: string, type: "PRIVATE KEY" | "PUBLIC KEY"): string {
    const cleanKey = key
      .replace(/-----BEGIN.*?-----/g, "")
      .replace(/-----END.*?-----/g, "")
      .replace(/\s+/g, "");

    return `-----BEGIN ${type}-----\n${cleanKey}\n-----END ${type}-----`;
  }

  // Translates the sign-then encrypt logic
  protected async encryptPayload(
    payload: string,
    signingKey: jose.CryptoKey | Uint8Array,
    encryptingKey: jose.CryptoKey | Uint8Array
  ): Promise<string> {
    // 1. Create JWS (Sign)
    const jws = await new jose.CompactSign(new TextEncoder().encode(payload))
      .setProtectedHeader({
        alg: SECURITY_DATA.JWS_ALG,
        typ: SECURITY_DATA.TOKEN_TYPE,
      })
      .sign(signingKey);

    // 2. Wrap JWS in JWE (Encrypt)
    const jwe = await new jose.CompactEncrypt(new TextEncoder().encode(jws))
      .setProtectedHeader({
        alg: SECURITY_DATA.JWE_ALG,
        enc: SECURITY_DATA.JWE_ENC,
        kid: this.encryptionId,
        typ: SECURITY_DATA.TOKEN_TYPE,
      })
      .encrypt(encryptingKey);
    return jwe;
  }

  protected async decryptToken(
    token: string,
    decryptingKey: jose.CryptoKey | Uint8Array,
    verificationKey: jose.CryptoKey | Uint8Array
  ): Promise<string> {
    // 1. Decrypt JWE
    const { plaintext: jwsBuffer } = await jose.compactDecrypt(
      token,
      decryptingKey
    );
    const jws = new TextDecoder().decode(jwsBuffer);
    // 2. Verify JWS
    const { payload: rawPayload } = await jose.compactVerify(
      jws,
      verificationKey
    );
    const payload = new TextDecoder().decode(rawPayload);
    // 3. Optional: Verify Claims (Issuer, Audience, etc.)
    const claims = JSON.parse(payload);

    const now = Math.floor(Date.now() / 1000);

    if (claims.exp && claims.exp < now) {
      throw new Error("Token expired");
    }
    if (claims.nbf && claims.nbf > now) {
      throw new Error("Token not yet valid");
    }
    // You can use jose.jwtVerify if the internal payload is a JWT

    return payload;
  }

  protected generateGuid(): string {
    return crypto.randomUUID();
  }
}
