// import type { Context } from "hono";
// import { prisma } from "../../lib/prisma.js";
// import { KhaltiService } from "../../services/payment/khalti-service.js";
// import { logger } from "../../services/system/logger-service.js";

// const getKhaltiConfig = async () => {
//   const method = await prisma.paymentMethod.findUnique({
//     where: { code: "khalti" },
//   });

//   if (!method || !method.isEnabled) {
//     throw new Error("Khalti payment is not enabled");
//   }

//   const config = method.config as any;
//   if (!config || !config.secretKey) {
//     throw new Error("Khalti configuration is missing secretKey");
//   }

//   const apiBase =
//     process.env.BASE_URL || process.env.API_URL || "http://localhost:3000";

//   return {
//     publicKey: config.publicKey || "",
//     secretKey: config.secretKey,
//     successUrl:
//       config.successUrl || `${apiBase}/api/v1/checkout/khalti/callback`,
//     failureUrl:
//       config.failureUrl || `${apiBase}/api/v1/checkout/khalti/callback`, // Khalti often uses same callback with status
//     baseUrl: config.baseUrl, // e.g. https://a.khalti.com/api/v2
//     refundBase: config.refundBase, // e.g. https://dev.khalti.com/api
//   };
// };

// export const khaltiController = {
//   /**
//    * Helper to get configured KhaltiService
//    */
//   async getKhaltiService() {
//     const config = await getKhaltiConfig();
//     return new KhaltiService(config);
//   },

//   /**
//    * Initiate Khalti Payment
//    */
//   async initiate(c: Context) {
//     try {
//       const { orderId } = await c.req.json();
//       const user = c.get("user"); // Assuming auth middleware sets user

//       const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: {
//           items: { include: { product: true } },
//           user: true,
//         },
//       });

//       if (!order) {
//         return c.json({ success: false, message: "Order not found" }, 404);
//       }

//       if (order.status !== "pending" && order.status !== "awaiting_payment") {
//         return c.json(
//           { success: false, message: "Order is not eligible for payment" },
//           400
//         );
//       }

//       const config = await getKhaltiConfig();

//       // Append source to callback URLs to distinguish app vs web
//       const source = "app";
//       if (config.successUrl.includes("?")) {
//         config.successUrl += `&source=${source}`;
//       } else {
//         config.successUrl += `?source=${source}`;
//       }

//       const service = new KhaltiService(config);

//       // Khalti amount is in Paisa (Rs 1 = 100 Paisa)
//       const amountInPaisa = Math.round(order.total * 100);

//       const initiateParams = {
//         amount: amountInPaisa,
//         purchase_order_id: order.id,
//         purchase_order_name: `Order #${order.id.slice(-8).toUpperCase()}`,
//         customer_info: {
//           name: order.user?.username || "Guest Customer",
//           email: order.user?.email || undefined,
//           phone: order.user?.phone || undefined,
//         },
//         product_details: order.items.map((item) => ({
//           identity: item.productId,
//           name: item.product.name,
//           total_price: Math.round(item.price * item.quantity * 100),
//           quantity: item.quantity,
//           unit_price: Math.round(item.price * 100),
//         })),
//       };

//       const result = await service.initiate(initiateParams);

//       // Save pidx to order for verification later
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { paymentIntentId: result.pidx },
//       });

//       await logger.info(
//         "PAYMENT_KHALTI_INIT_APP",
//         "Khalti Payment Initiated (App)",
//         {
//           orderId,
//           amount: amountInPaisa / 100,
//           pidx: result.pidx,
//         },
//         user?.userId
//       );

//       return c.json({
//         success: true,
//         data: result, // contains payment_url
//       });
//     } catch (error: any) {
//       console.error("Khalti Init Error:", error);
//       await logger.error(
//         "PAYMENT_KHALTI_INIT_ERROR",
//         "Khalti Init Failed",
//         { error: error.message },
//         c.get("user")?.userId
//       );
//       return c.json({ success: false, message: error.message }, 500);
//     }
//   },

//   /**
//    * Initiate Khalti Payment (Web Redirect version)
//    * This is intended to be opened directly in a mobile WebView
//    */
//   async initiateWeb(c: Context) {
//     const orderId = c.req.query("orderId");

//     const renderInitPage = (message: string, isError = false) => {
//       // For initiation errors, if it's the web flow, redirect to web failure
//       // We can detect if it's Web based on whether we were called from initiateWeb (which we are)
//       const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
//       const backUrl = isError
//         ? `${baseUrl}/checkout/failure?reason=init_failed`
//         : "#";
//       const appBackUrl = "luxstore://checkout/failure?reason=init_failed";

//       return c.html(`
//         <html>
//           <head>
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//               body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f9; color: #333; }
//               .loader { border: 4px solid #f3f3f3; border-top: 4px solid ${
//                 isError ? "#ef4444" : "#5C2D91"
//               }; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin-bottom: 20px; }
//               @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//               h2 { margin: 0; font-size: 1.2rem; }
//               .btn { margin-top: 20px; padding: 10px 20px; background: #5C2D91; color: white; text-decoration: none; border-radius: 5px; }
//             </style>
//           </head>
//           <body>
//             ${isError ? "" : '<div class="loader"></div>'}
//             <h2>${message}</h2>
//             ${
//               isError
//                 ? `
//               <div style="display:flex; gap:10px;">
//                 <a href="${backUrl}" class="btn">Back to Web</a>
//                 <a href="${appBackUrl}" class="btn" style="background:#333;">Back to App</a>
//               </div>
//             `
//                 : "<p>Please wait while we connect to Khalti...</p>"
//             }
//           </body>
//         </html>
//       `);
//     };

//     if (!orderId) {
//       return renderInitPage("Order ID is required", true);
//     }

//     try {
//       const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: {
//           items: { include: { product: true } },
//           user: true,
//         },
//       });

//       if (!order) {
//         return renderInitPage("Order not found", true);
//       }

//       if (order.status !== "pending" && order.status !== "awaiting_payment") {
//         return renderInitPage("Order is not eligible for payment", true);
//       }

//       const config = await getKhaltiConfig();

//       // Get source from query, default to 'web' for this endpoint
//       const source = c.req.query("source") || "web";
//       if (config.successUrl.includes("?")) {
//         config.successUrl += `&source=${source}`;
//       } else {
//         config.successUrl += `?source=${source}`;
//       }

//       const service = new KhaltiService(config);

//       const amountInPaisa = Math.round(order.total * 100);

//       const initiateParams = {
//         amount: amountInPaisa,
//         purchase_order_id: order.id,
//         purchase_order_name: `Order #${order.id.slice(-8).toUpperCase()}`,
//         customer_info: {
//           name: order.user?.username || "Guest Customer",
//           email: order.user?.email || undefined,
//           phone: order.user?.phone || undefined,
//         },
//         product_details: order.items.map((item) => ({
//           identity: item.productId,
//           name: item.product.name,
//           total_price: Math.round(item.price * item.quantity * 100),
//           quantity: item.quantity,
//           unit_price: Math.round(item.price * 100),
//         })),
//       };

//       const result = await service.initiate(initiateParams);

//       await prisma.order.update({
//         where: { id: orderId },
//         data: { paymentIntentId: result.pidx },
//       });

//       // Directly redirect to Khalti checkout
//       return c.redirect(result.payment_url);
//     } catch (error: any) {
//       console.error("Khalti Web Init Error:", error);
//       return renderInitPage(
//         error.message || "Failed to initiate payment",
//         true
//       );
//     }
//   },

//   /**
//    * Handle Callback from Khalti
//    */
//   async handleCallback(c: Context) {
//     const pidx = c.req.query("pidx");
//     const status = c.req.query("status");
//     const purchase_order_id = c.req.query("purchase_order_id");
//     const source = c.req.query("source") || "app"; // Default to app for safety

//     const renderRedirectPage = (targetUrl: string, message: string) => {
//       return c.html(`
//         <html>
//           <head>
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//               body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f9; color: #333; }
//               .loader { border: 4px solid #f3f3f3; border-top: 4px solid #5C2D91; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin-bottom: 20px; }
//               @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//               h2 { margin: 0; font-size: 1.2rem; }
//             </style>
//           </head>
//           <body>
//             <div class="loader"></div>
//             <h2>${message}</h2>
//             <p>Please wait while we redirect you back to the app...</p>
//             <script>
//               setTimeout(function() {
//                 window.location.href = "${targetUrl}";
//               }, 1000);
//             </script>
//           </body>
//         </html>
//       `);
//     };

//     const getTargetUrl = (isSuccess: boolean, params: string) => {
//       if (source === "web") {
//         const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
//         return isSuccess
//           ? `${baseUrl}/checkout/success?${params}`
//           : `${baseUrl}/checkout/failure?${params}`;
//       }
//       return isSuccess
//         ? `luxstore://checkout/success?${params}`
//         : `luxstore://checkout/failure?${params}`;
//     };

//     try {
//       if (!pidx || status !== "Completed") {
//         const targetUrl = getTargetUrl(
//           false,
//           `reason=${status || "cancelled"}`
//         );
//         return renderRedirectPage(targetUrl, "Payment Cancelled");
//       }

//       // 1. Pre-fetch order using pidx to ensure this pidx belongs to our system
//       const order = await prisma.order.findFirst({
//         where: { paymentIntentId: pidx },
//       });

//       if (!order) {
//         console.error("[Khalti] Received callback for unknown pidx:", pidx);
//         const targetUrl = getTargetUrl(false, "reason=invalid_transaction");
//         return renderRedirectPage(targetUrl, "Invalid Transaction");
//       }

//       // Security check: If orderId was passed in query, it MUST match the order found by pidx
//       if (purchase_order_id && purchase_order_id !== order.id) {
//         console.error("[Khalti] Order ID mismatch in callback:", {
//           queryId: purchase_order_id,
//           foundId: order.id,
//         });
//         const targetUrl = getTargetUrl(false, "reason=security_mismatch");
//         return renderRedirectPage(targetUrl, "Security Mismatch");
//       }

//       // 2. Handle Idempotency (Already processed)
//       if (
//         order.status === "processing" ||
//         order.status === "delivered" ||
//         order.status === "shipped"
//       ) {
//         console.log(
//           "[Khalti] Order already processed, skipping verification:",
//           order.id
//         );
//         const targetUrl = getTargetUrl(true, `orderId=${order.id}`);
//         return renderRedirectPage(targetUrl, "Order already confirmed");
//       }

//       const config = await getKhaltiConfig();
//       const service = new KhaltiService(config);

//       // 3. Verify with Khalti lookup API (Source of truth)
//       const verification = await service.verify(pidx);

//       if (verification.status !== "Completed") {
//         const targetUrl = getTargetUrl(false, "reason=verification_failed");
//         return renderRedirectPage(targetUrl, "Verification Failed");
//       }

//       // 4. Stricter response validation
//       // Ensure the amount Khalti says was paid matches what our DB says the order total is
//       const expectedPaisa = Math.round(order.total * 100);
//       if (Math.abs(verification.total_amount - expectedPaisa) > 1) {
//         // Allow 1 paisa rounding diff
//         console.error("[Khalti] Amount mismatch in verification:", {
//           expected: expectedPaisa,
//           actual: verification.total_amount,
//           orderId: order.id,
//         });
//         const targetUrl = getTargetUrl(false, "reason=amount_mismatch");
//         return renderRedirectPage(targetUrl, "Amount Mismatch");
//       }

//       // Ensure the purchase_order_id in Khalti's database matches our local one
//       if (
//         verification.purchase_order_id &&
//         verification.purchase_order_id !== order.id
//       ) {
//         console.error("[Khalti] Khalti Response Order ID mismatch:", {
//           responseId: verification.purchase_order_id,
//           localId: order.id,
//         });
//         const targetUrl = getTargetUrl(false, "reason=id_mismatch");
//         return renderRedirectPage(targetUrl, "Technical Error");
//       }

//       // 5. Update Order status only now
//       await prisma.order.update({
//         where: { id: order.id },
//         data: {
//           status: "processing",
//           paymentMethod: "khalti",
//           paymentIntentId: verification.transaction_id || pidx, // Use transaction_id for refunds, fallback to pidx
//         },
//       });

//       console.log(
//         "[Khalti] Payment success successfully processed for order:",
//         order.id
//       );

//       await logger.info(
//         "PAYMENT_KHALTI_SUCCESS",
//         "Khalti Payment Verified",
//         {
//           orderId: order.id,
//           amount: verification.total_amount / 100,
//           pidx,
//         },
//         order.userId || undefined
//       );

//       const targetUrl = getTargetUrl(true, `orderId=${order.id}`);
//       return renderRedirectPage(targetUrl, "Payment Successful!");
//     } catch (error: any) {
//       console.error("Khalti Callback Error:", error);
//       await logger.error(
//         "PAYMENT_KHALTI_CALLBACK_ERROR",
//         "Khalti Verification Failed",
//         {
//           pidx: c.req.query("pidx"),
//           error: error.message,
//         }
//       );
//       const targetUrl = getTargetUrl(false, "reason=internal_error");
//       return renderRedirectPage(targetUrl, "Processing Error");
//     }
//   },
// };
