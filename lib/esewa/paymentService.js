// import type { Context } from 'hono';
// import { prisma } from '../../lib/prisma.js';
// import { EsewaService } from '../../services/payment/esewa-service.js';
// import { logger } from '../../services/system/logger-service.js';

// const getEsewaConfig = async () => {
//   const method = await prisma.paymentMethod.findUnique({
//     where: { code: 'esewa' }
//   });

//   if (!method || !method.isEnabled) {
//     throw new Error('eSewa payment is not enabled');
//   }

//   const config = method.config as any;
//   if (!config || !config.merchantId || !config.secretKey) {
//      throw new Error('eSewa configuration is missing');
//   }

//   // Determine API Base URL from environment or default
//   const apiBase = process.env.BASE_URL || process.env.API_URL || 'http://localhost:3000';

//   return {
//     merchantId: config.merchantId,
//     secretKey: config.secretKey,
//     successUrl: config.successUrl || `${apiBase}/api/v1/checkout/esewa/success`,
//     failureUrl: config.failureUrl || `${apiBase}/api/v1/checkout/esewa/failure`,
//     baseUrl: config.baseUrl
//   };
// };

// export const esewaController = {
//   /**
//    * Initiate Payment
//    * Returns the payload required to submit the eSewa form
//    */
//   async initiate(c: Context) {
//     try {
//       const { orderId } = await c.req.json();
//       const userId = c.get('jwtPayload')?.sub; // Assuming auth middleware

//       const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: { items: true } // verify ownership if needed
//       });

//       if (!order) {
//         return c.json({ success: false, message: 'Order not found' }, 404);
//       }

//       if (order.status !== 'pending' && order.status !== 'awaiting_payment') {
//          return c.json({ success: false, message: 'Order is not eligible for payment' }, 400);
//       }

//       const config = await getEsewaConfig();

//       // Append source=app to success/failure URLs
//       const source = 'app';
//       if (config.successUrl.includes('?')) {
//           config.successUrl += `&source=${source}`;
//       } else {
//           config.successUrl += `?source=${source}`;
//       }
//       if (config.failureUrl.includes('?')) {
//           config.failureUrl += `&source=${source}`;
//       } else {
//           config.failureUrl += `?source=${source}`;
//       }

//       const service = new EsewaService(config);

//       // Unique Transaction UUID for this attempt
//       // eSewa requires unique ID. If we retry, we might need a suffix?
//       // For now, using orderId directly. If multiple attempts needed, might need a transaction record.
//       const transactionUuid = `${orderId}-${Date.now()}`;

//       // Calculate amounts
//       const amount = order.total;
//       // In this system, 'total' typically includes tax/shipping if calculated previously.
//       // But eSewa asks for breakdown.
//       // For simplicity, we'll put everything in total_amount and 0 for others unless we have precise breakdown in Order model.
//       // Our Order model has 'total' (final).
//       // eSewa V2: total_amount = amount + tax + charge + delivery
//       // We will treat order.total as legitimate total and set others to 0.

//       const payload = service.generatePaymentPayload({
//         amount: amount,
//         taxAmount: 0,
//         serviceCharge: 0,
//         deliveryCharge: 0,
//         transactionUuid: transactionUuid,
//         productCode: config.merchantId,
//       });

//       await logger.info('PAYMENT_ESEWA_INIT_APP', 'eSewa Payment Initiated (App)', {
//           orderId,
//           amount,
//           transactionUuid
//       }, userId);

//       return c.json({
//         success: true,
//         data: payload,
//         url: config.baseUrl || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form' // Default to test URL if not set
//       });

//     } catch (error: any) {
//       console.error('eSewa Init Error:', error);
//       await logger.error('PAYMENT_ESEWA_INIT_ERROR', 'eSewa Init Failed', { error: error.message }, c.get('jwtPayload')?.sub);
//       return c.json({ success: false, message: error.message }, 500);
//     }
//   },

//   /**
//    * Initiate eSewa Payment (Web version)
//    * Returns an HTML form that auto-submits to eSewa
//    */
//   async initiateWeb(c: Context) {
//     const orderId = c.req.query('orderId');

//     const renderErrorPage = (message: string) => {
//       const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//       const webBackUrl = `${baseUrl}/checkout/failure?reason=init_failed`;
//       const appBackUrl = 'luxstore://checkout/failure?reason=init_failed';

//       return c.html(`
//         <html>
//           <head>
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//               body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f9; color: #333; }
//               .error-box { padding: 20px; background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; text-align: center; }
//               .btn { margin-top: 20px; padding: 10px 20px; background: #60A5FA; color: white; text-decoration: none; border-radius: 5px; }
//             </style>
//           </head>
//           <body>
//             <div class="error-box">
//               <h2>Payment Initiation Failed</h2>
//               <p>${message}</p>
//             </div>
//             <div style="display:flex; gap:10px;">
//               <a href="${webBackUrl}" class="btn">Back to Web</a>
//               <a href="${appBackUrl}" class="btn" style="background:#333;">Back to App</a>
//             </div>
//           </body>
//         </html>
//       `);
//     };

//     if (!orderId) {
//        return renderErrorPage("Order ID is required");
//     }

//     try {
//       const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: { items: true }
//       });

//       if (!order) {
//         return renderErrorPage("Order not found");
//       }

//       if (order.status !== 'pending' && order.status !== 'awaiting_payment') {
//          return renderErrorPage("Order is not eligible for payment");
//       }

//       const config = await getEsewaConfig();

//       // Get source from query, default to 'web' for this endpoint
//       const source = c.req.query('source') || 'web';
//       if (config.successUrl.includes('?')) {
//           config.successUrl += `&source=${source}`;
//       } else {
//           config.successUrl += `?source=${source}`;
//       }
//       if (config.failureUrl.includes('?')) {
//           config.failureUrl += `&source=${source}`;
//       } else {
//           config.failureUrl += `?source=${source}`;
//       }

//       const service = new EsewaService(config);

//       const transactionUuid = `${orderId}-${Date.now()}`;
//       const amount = order.total;

//       const payload = service.generatePaymentPayload({
//         amount: amount,
//         taxAmount: 0,
//         serviceCharge: 0,
//         deliveryCharge: 0,
//         transactionUuid: transactionUuid,
//         productCode: config.merchantId,
//       });

//       const url = config.baseUrl || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

//       // Construct HTML form to auto-submit
//       return c.html(`
//         <html>
//           <head>
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//               body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; font-family: sans-serif; margin: 0; }
//               .loader { border: 4px solid #f3f3f3; border-top: 4px solid #60A5FA; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
//               @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//               h2 { font-size: 1.1rem; color: #555; }
//             </style>
//           </head>
//           <body>
//             <div class="loader"></div>
//             <h2>Connecting to eSewa...</h2>
//             <form id="esewaForm" method="POST" action="${url}">
//               ${Object.keys(payload)
//                 .map(
//                   (key) => `
//                 <input type="hidden" name="${key}" value="${(payload as any)[key]}" />
//               `
//                 )
//                 .join("")}
//             </form>
//             <script>
//               setTimeout(function() {
//                  document.getElementById('esewaForm').submit();
//               }, 500);
//             </script>
//           </body>
//         </html>
//       `);

//     } catch (error: any) {
//       console.error('eSewa Web Init Error:', error);
//       return renderErrorPage(error.message || "Failed to setup eSewa payment");
//     }
//   },

//   async handleSuccess(c: Context) {
//     const source = c.req.query('source') || 'app';

//     const getTargetUrl = (isSuccess: boolean, params: string) => {
//         if (source === 'web') {
//             const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//             return isSuccess
//                 ? `${baseUrl}/checkout/success?${params}`
//                 : `${baseUrl}/checkout/failure?${params}`;
//         }
//         return isSuccess
//             ? `luxstore://checkout/success?${params}`
//             : `luxstore://checkout/failure?${params}`;
//     };

//     const renderRedirectPage = (targetUrl: string, message: string) => {
//       return c.html(`
//         <html>
//           <head>
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//               body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f9; color: #333; }
//               .loader { border: 4px solid #f3f3f3; border-top: 4px solid #60A5FA; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin-bottom: 20px; }
//               @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//               h2 { margin: 0; font-size: 1.2rem; }
//             </style>
//           </head>
//           <body>
//             <div class="loader"></div>
//             <h2>${message}</h2>
//             <script>
//               setTimeout(function() {
//                 window.location.href = "${targetUrl}";
//               }, 1000);
//             </script>
//           </body>
//         </html>
//       `);
//     };

//     try {
//       const encodedData = c.req.query('data');
//       if (!encodedData) {
//          return renderRedirectPage(getTargetUrl(false, 'reason=no_data'), "Redirecting...");
//       }

//       const config = await getEsewaConfig();
//       const service = new EsewaService(config);
//       const decoded = service.decodeData(encodedData);

//       if (!decoded) {
//          return renderRedirectPage(getTargetUrl(false, 'reason=invalid_data'), "Redirecting...");
//       }

//       if (decoded.status !== 'COMPLETE') {
//          return renderRedirectPage(getTargetUrl(false, `reason=${decoded.status}`), "Redirecting...");
//       }

//       const isValid = service.verifyResponse(decoded);
//       if (!isValid) {
//          return renderRedirectPage(getTargetUrl(false, 'reason=invalid_signature'), "Redirecting...");
//       }

//       const orderId = decoded.transaction_uuid.split('-')[0];

//       await prisma.order.update({
//         where: { id: orderId },
//         data: {
//           status: 'processing',
//           paymentMethod: 'esewa',
//           paymentIntentId: decoded.transaction_code,
//         }
//       });

//       await logger.info('PAYMENT_ESEWA_SUCCESS', 'eSewa Payment Verified', {
//           orderId,
//           amount: decoded.total_amount,
//           refId: decoded.transaction_code
//       });

//       return renderRedirectPage(getTargetUrl(true, `orderId=${orderId}`), "Payment Successful!");

//     } catch (error: any) {
//       console.error('eSewa Success Error:', error);
//       await logger.error('PAYMENT_ESEWA_CALLBACK_ERROR', 'eSewa Verification Failed', {
//          error: error.message,
//          data: c.req.query('data')
//       });
//       return renderRedirectPage(getTargetUrl(false, 'reason=internal_error'), "Redirecting...");
//     }
//   },

//   /**
//    * Handle Failure Callback
//    */
//   async handleFailure(c: Context) {
//     const source = c.req.query('source') || 'app';
//     const renderRedirectPage = (targetUrl: string, message: string) => {
//       return c.html(`
//         <html>
//           <head>
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//               body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f9; color: #333; }
//               .loader { border: 4px solid #f3f3f3; border-top: 4px solid #60A5FA; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin-bottom: 20px; }
//               @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//               h2 { margin: 0; font-size: 1.2rem; }
//             </style>
//           </head>
//           <body>
//             <div class="loader"></div>
//             <h2>${message}</h2>
//             <script>
//               setTimeout(function() {
//                 window.location.href = "${targetUrl}";
//               }, 1000);
//             </script>
//           </body>
//         </html>
//       `);
//     };

//     const targetUrl = source === 'web'
//         ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/failure?reason=transaction_failed`
//         : 'luxstore://checkout/failure?reason=transaction_failed';

//     return renderRedirectPage(targetUrl, "Payment Failed. Redirecting...");
//   }
// };
