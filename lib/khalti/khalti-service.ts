// import axios from "axios";

// export interface KhaltiConfig {
//   publicKey: string;
//   secretKey: string;
//   baseUrl?: string; // e.g., https://khalti.com/api/v2
//   refundBase?: string; // e.g., https://dev.khalti.com/api
//   successUrl: string;
//   failureUrl: string;
// }

// export interface KhaltiInitiateParams {
//   amount: number; // in paisa
//   purchase_order_id: string;
//   purchase_order_name: string;
//   customer_info?: {
//     name?: string;
//     email?: string;
//     phone?: string;
//   };
//   amount_breakdown?: Array<{
//     label: string;
//     amount: number;
//   }>;
//   product_details?: Array<{
//     identity: string;
//     name: string;
//     total_price: number;
//     quantity: number;
//     unit_price: number;
//   }>;
// }

// export class KhaltiService {
//   private config: KhaltiConfig;
//   private apiBase: string;

//   constructor(config: KhaltiConfig) {
//     this.config = config;
//     this.apiBase = config.baseUrl || "https://a.khalti.com/api/v2";
//   }

//   /**
//    * Initiate Payment via Khalti ePay (V2)
//    */
//   async initiate(params: KhaltiInitiateParams) {
//     try {
//       const payload = {
//         return_url: this.config.successUrl,
//         website_url: this.config.successUrl.split("/api")[0], // Base URL of the site
//         amount: params.amount,
//         purchase_order_id: params.purchase_order_id,
//         purchase_order_name: params.purchase_order_name,
//         customer_info: params.customer_info,
//         amount_breakdown: params.amount_breakdown,
//         product_details: params.product_details,
//       };

//       const response = await axios.post(
//         `${this.apiBase}/epayment/initiate/`,
//         payload,
//         {
//           headers: {
//             Authorization: `Key ${this.config.secretKey}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       return response.data; // { pidx, payment_url, expires_at, expires_in }
//     } catch (error: any) {
//       const errorData = error.response?.data;
//       console.error("Khalti Initiate Error:", {
//         status: error.response?.status,
//         data: errorData,
//         message: error.message,
//       });
//       throw new Error(
//         errorData?.detail ||
//           errorData?.message ||
//           "Failed to initiate Khalti payment"
//       );
//     }
//   }

//   /**
//    * Verify Payment via Khalti lookup
//    */
//   async verify(pidx: string) {
//     try {
//       console.log(`[Khalti Verify] Initiating lookup for pidx: ${pidx}`);
//       const response = await axios.post(
//         `${this.apiBase}/epayment/lookup/`,
//         { pidx },
//         {
//           headers: {
//             Authorization: `Key ${this.config.secretKey}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log(
//         `[Khalti Verify] Response status: ${response.data?.status}, Amount: ${response.data?.total_amount}`
//       );
//       return response.data;
//     } catch (error: any) {
//       const errorData = error.response?.data;
//       console.error("Khalti Verify Error:", {
//         status: error.response?.status,
//         data: errorData,
//         message: error.message,
//         pidx,
//       });
//       throw new Error(
//         errorData?.detail ||
//           errorData?.message ||
//           "Failed to verify Khalti payment"
//       );
//     }
//   }

//   /**
//    * Helper to determine the correct refund base URL
//    */
//   private getRefundBaseUrl(): string {
//     // 1. If refundBase is explicitly provided in config, use it
//     if (this.config.refundBase) {
//       return this.config.refundBase;
//     }

//     // 2. Fallback to dynamic detection based on secret key or baseUrl

//     // Check secret key prefix - Khalti keys usually start with 'test_' or 'live_'
//     const isTestKey = (this.config.secretKey || "")
//       .toLowerCase()
//       .startsWith("test");
//     const isDevUrl =
//       this.apiBase.includes("dev") || this.apiBase.includes("sandbox");

//     if (isTestKey || isDevUrl) {
//       return "https://dev.khalti.com/api";
//     }
//     return "https://khalti.com/api";
//   }

//   /**
//    * Refund Payment via Khalti API
//    * @param transaction_id The transaction ID obtained from lookup/verify
//    * @param amount Optional amount in paisa for partial refund
//    * @param mobile Optional mobile number for bank refunds
//    */
//   async refund(transaction_id: string, amount?: number, mobile?: string) {
//     const refundBase = this.getRefundBaseUrl();
//     const url = `${refundBase}/merchant-transaction/${transaction_id}/refund/`;

//     try {
//       const payload: any = {};
//       if (amount) payload.amount = Math.round(amount);
//       if (mobile) payload.mobile = mobile;

//       console.log(`[Khalti Refund] Initiating refund:`, {
//         url,
//         txnId: transaction_id,
//         amountPaisa: payload.amount,
//         usingSandbox: url.includes("dev"),
//         keyType: (this.config.secretKey || "").slice(0, 4) + "...",
//       });

//       const response = await axios.post(url, payload, {
//         headers: {
//           Authorization: `Key ${this.config.secretKey}`,
//           "Content-Type": "application/json",
//         },
//       });

//       console.log(`[Khalti Refund] Response:`, response.data);
//       return response.data;
//     } catch (error: any) {
//       const errorData = error.response?.data;
//       console.error("Khalti Refund Error:", {
//         status: error.response?.status,
//         data: errorData,
//         message: error.message,
//         url,
//         txnId: transaction_id,
//       });
//       throw new Error(
//         errorData?.detail ||
//           errorData?.message ||
//           "Failed to process Khalti refund"
//       );
//     }
//   }
// }
