import { HblBaseService, SECURITY_DATA } from "./hblBaseService";

export interface PaymentDetails {
  orderNo: string;
  amount: number;
  productDescription: string;
  currencyCode: string;
}

export class HblPaymentService extends HblBaseService {
  private details: PaymentDetails;
  private accessToken: string;

  constructor(details: PaymentDetails) {
    super();
    this.details = details;
    const tokens: Record<string, string | undefined> = {
      USD: process.env.HBL_ACCESS_TOKEN_USD,
      NPR: process.env.HBL_ACCESS_TOKEN_NPR,
    };
    this.accessToken = tokens[details.currencyCode] || "";
  }

  /**
   * Executes the payment request (Equivalent to ExecuteJose in Payment.php)
   */
  public async executeJose() {
    const now = Math.floor(Date.now() / 1000);
    const amountText = (this.details.amount * 100).toString().padStart(12, "0");

    const request = {
      apiRequest: {
        requestMessageID: this.generateGuid(),
        requestDateTime: new Date().toISOString(),
        language: "en-US",
      },
      officeId: process.env.HBL_MERCHANT_ID,
      orderNo: this.details.orderNo,
      productDescription: this.details.productDescription,
      paymentType: "CC",
      paymentCategory: "ECOM",
      storeCardDetails: {
        storeCardFlag: "N",
        storedCardUniqueID: "{{guid}}",
      },
      installmentPaymentDetails: {
        ippFlag: "N",
        installmentPeriod: 0,
        interestType: null,
      },
      mcpFlag: "N",
      request3dsFlag: process.env.HBL_REQUEST_3DS_FLAG || "Y",
      transactionAmount: {
        amountText: amountText,
        currencyCode: this.details.currencyCode,
        decimalPlaces: 2,
        amount: this.details.amount,
      },
      notificationURLs: {
        confirmationURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/hbl/success`,
        failedURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/hbl/failed`,
        cancellationURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/hbl/cancel`,
        backendURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/hbl/backend`,
      },
      deviceDetails: {
        browserIp: "1.0.0.1",
        browser: "Next.js App",
        browserUserAgent: "Next.js Client - not from header",
        mobileDeviceFlag: "N",
      },
      purchaseItems: [
        {
          purchaseItemType: "ticket",
          referenceNo: "2322460376026", // Placeholder or dynamic
          purchaseItemDescription: this.details.productDescription,
          purchaseItemPrice: {
            amountText: amountText,
            currencyCode: this.details.currencyCode,
            decimalPlaces: 2,
            amount: this.details.amount,
          },
          subMerchantID: "string",
          passengerSeqNo: 1,
        },
      ],
      customFieldList: [
        {
          fieldName: "TestField",
          fieldValue: "This is test",
        },
      ],
    };

    const payload = {
      request: request,
      iss: this.accessToken,
      aud: "PacoAudience",
      CompanyApiKey: this.accessToken,
      iat: now,
      nbf: now,
      exp: now + 3600, // 1 hour expiration
    };

    const stringPayload = JSON.stringify(payload);

    // Load keys from environment
    const signingKeyPem = process.env.HBL_MERCHANT_SIGNING_PRIVATE_KEY || "";
    const encryptionKeyPem = process.env.HBL_PACO_ENCRYPTION_PUBLIC_KEY || "";

    const signingKey = await this.getPrivateKey(signingKeyPem);
    const encryptingKey = await this.getPublicKey(
      encryptionKeyPem,
      SECURITY_DATA.JWE_ALG
    );

    const body = await this.encryptPayload(
      stringPayload,
      signingKey,
      encryptingKey
    );

    const targetUrl = `${this.baseUrl}/api/1.0/Payment/prePaymentUI`;
    console.log("HBL API URL:", targetUrl);

    // Make the API request
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Accept: "application/jose",
        CompanyApiKey: this.accessToken,
        "Content-Type": "application/jose; charset=utf-8",
        "User-Agent": "", // PHP code manually removes User-Agent
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HBL API error: ${response.statusText}`);
    }

    const token = await response.text();

    // Decrypt and Verify Response
    const decryptionKeyPem =
      process.env.HBL_MERCHANT_DECRYPTION_PRIVATE_KEY || "";
    const verificationKeyPem = process.env.HBL_PACO_SIGNING_PUBLIC_KEY || "";

    const decryptingKey = await this.getPrivateKey(
      decryptionKeyPem,
      SECURITY_DATA.JWE_ALG
    );
    const verificationKey = await this.getPublicKey(verificationKeyPem);

    return await this.decryptToken(token, decryptingKey, verificationKey);
  }
}
