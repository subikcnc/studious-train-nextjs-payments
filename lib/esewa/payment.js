// import crypto from 'crypto';

// export interface EsewaConfig {
//   merchantId: string;
//   secretKey: string;
//   successUrl: string;
//   failureUrl: string;
//   baseUrl?: string; // e.g., https://rc-epay.esewa.com.np or https://epay.esewa.com.np
// }

// export class EsewaService {
//   private config: EsewaConfig;

//   constructor(config: EsewaConfig) {
//     this.config = config;
//   }

//   /**
//    * Generates HMAC-SHA256 signature
//    * Message format for eSewa v2: "total_amount,transaction_uuid,product_code"
//    */
//   private generateSignature(message: string): string {
//     // eSewa requires the secret key to be used to sign the message
//     const hmac = crypto.createHmac('sha256', this.config.secretKey);
//     hmac.update(message);
//     return hmac.digest('base64');
//   }

//   /**
//    * Generates the payload required for eSewa form submission
//    */
//   generatePaymentPayload(params: {
//     amount: number;
//     taxAmount?: number;
//     serviceCharge?: number;
//     deliveryCharge?: number;
//     transactionUuid: string;
//     productCode: string;
//   }) {
//     const {
//       amount,
//       taxAmount = 0,
//       serviceCharge = 0,
//       deliveryCharge = 0,
//       transactionUuid,
//       productCode
//     } = params;

//     const totalAmount = amount + taxAmount + serviceCharge + deliveryCharge;

//     // Format must be total_amount,transaction_uuid,product_code (values only)
//     const message = `${totalAmount},${transactionUuid},${productCode}`;
//     const signature = this.generateSignature(message);

//     return {
//       amount: amount.toString(), // eSewa v2 often prefers simple strings, but let's try strict equality if needed.
//                                  // Actually, V2 docs say: total_amount MUST be equal to sum.
//                                  // Let's use string conversion but maybe ensure no floating point weirdness.
//       tax_amount: taxAmount.toString(),
//       product_service_charge: serviceCharge.toString(),
//       product_delivery_charge: deliveryCharge.toString(),
//       total_amount: totalAmount.toString(),
//       transaction_uuid: transactionUuid,
//       product_code: productCode,
//       success_url: this.config.successUrl,
//       failure_url: this.config.failureUrl,
//       signed_field_names: "total_amount,transaction_uuid,product_code",
//       signature: signature,
//     };
//   }

//   /**
//    * Verifies the response from eSewa
//    * When eSewa redirects back to success_url, it sends data encoded in base64
//    * Note: This is for the 'encoded' parameter approach if used,
//    * OR standard parameter verification.
//    *
//    * For V2, the response typically contains the signature and signed fields.
//    */
//   verifyResponse(response: Record<string, string>): boolean {
//     const { signature, signed_field_names } = response;
//     if (!signature || !signed_field_names) return false;

//     // specific logic for parsing specific eSewa response format
//     // For simplicity in this iteration, we re-construct the signature
//     // from the fields specified in signed_field_names

//     // Example signed_field_names: "total_amount,transaction_uuid,product_code"
//     const fields = signed_field_names.split(',');
//     const message = fields.map(field => `${field}=${response[field]}`).join(',');

//     const calculatedSignature = this.generateSignature(message);

//     return calculatedSignature === signature;
//   }

//   /**
//    * Decode the "data" param (Base64) if eSewa sends a single encoded blob
//    */
//   decodeData(encodedData: string): any {
//     try {
//       const buff = Buffer.from(encodedData, 'base64');
//       const text = buff.toString('utf-8');
//       return JSON.parse(text);
//     } catch (e) {
//       return null;
//     }
//   }
// }`
