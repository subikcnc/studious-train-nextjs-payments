import { HblPaymentService } from "@/lib/hbl/hblPaymentService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body (orderNo, amount, etc.)
    const { orderNo, amount, productDescription, currencyCode } = body;

    const paymentService = new HblPaymentService({
      orderNo,
      amount,
      productDescription,
      currencyCode,
    });

    // This calls ExecuteJose equivalent
    const hblResponse = await paymentService.executeJose();

    return NextResponse.json({
      success: true,
      data: JSON.parse(hblResponse),
    });
  } catch (error: any) {
    console.error("HBL Payment Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/*
Sample response from HBL
{
    "success": true,
    "data": {
        "response": {
            "Data": {
                "paymentIncompleteResult": {
                    "notificationURLs": {
                        "ConfirmationUrl": "http://localhost:3000/api/hbl/success?orderNo=ORD-12345&productDescription=Test%2bProduct&controllerInternalId=493c4f4a6d7b4325b95d0de66e848d30",
                        "CancellationUrl": "http://localhost:3000/api/hbl/cancel?orderNo=ORD-12345&productDescription=Test%2bProduct&controllerInternalId=493c4f4a6d7b4325b95d0de66e848d30",
                        "FailedUrl": "http://localhost:3000/api/hbl/failed?orderNo=ORD-12345&productDescription=Test%2bProduct&controllerInternalId=493c4f4a6d7b4325b95d0de66e848d30",
                        "BackendUrl": "http://localhost:3000/api/hbl/backend"
                    },
                    "aresACSChallenge": null,
                    "failedReason": null,
                    "availablePaymentTypes": [
                        "CC",
                        "CC-AX",
                        "CC-CA",
                        "CC-UP",
                        "CC-VI"
                    ],
                    "untokenizedStoredCardList": null,
                    "storedCardUniqueID": null,
                    "paymentExpiryDateTime": "2026-01-15T06:21:41.9407692Z",
                    "linkExpiryDateTime": "2026-01-15T06:21:41.9407692Z",
                    "pspExpiryDateTime": null,
                    "currencyConversionType": "None",
                    "currencyConversionMerchantId": null,
                    "preferredPaymentTypes": null,
                    "transactionDateTime": "2026-01-14T06:21:41.9407692Z",
                    "orderNo": "ORD-12345",
                    "productDescription": "Test Product",
                    "InvoiceNo2C2P": null,
                    "pspInvoiceNo": null,
                    "pspReferenceNo": null,
                    "controllerInternalID": "493c4f4a6d7b4325b95d0de66e848d30",
                    "paymentStatusInfo": {
                        "PaymentStatus": "PCPS",
                        "PaymentStep": "GP",
                        "LastUpdatedDateTime": "2026-01-14T06:21:41.9187235Z"
                    },
                    "paymentType": "CC",
                    "channelCode": null,
                    "agentCode": null,
                    "currencyConversionFlag": false,
                    "transactionAmount": {
                        "AmountText": "000000001050",
                        "CurrencyCode": "NPR",
                        "DecimalPlaces": 2,
                        "Amount": 10.5
                    },
                    "settlementAmount": null,
                    "customFieldList": null,
                    "userDefined1": null,
                    "userDefined2": null,
                    "userDefined3": null,
                    "userDefined4": null,
                    "userDefined5": null,
                    "userDefined6": null,
                    "userDefined7": null,
                    "userDefined8": null,
                    "userDefined9": null,
                    "userDefined10": null,
                    "clientIp": null,
                    "officeId": "9104137120",
                    "ddcId": null,
                    "statementDescriptor": null,
                    "transactionInitiator": null,
                    "previousPaymentId": null
                },
                "paymentPage": {
                    "paymentPageURL": "https://payment.demo-paco.2c2p.com/payment/?pid=493c4f4a6d7b4325b95d0de66e848d30&lang=en-US",
                    "validTillDateTime": "2026-01-15T06:21:41"
                }
            },
            "Version": "1.0",
            "ApiResponse": {
                "ResponseMessageId": "64a8b843-5e21-4964-87e7-2f42400c3748",
                "ResponseToRequestMessageId": "1dd0bbfe-8182-4dc8-8794-b9f0b2fc592f",
                "ResponseCode": "PC-B050001",
                "ResponseDescription": "Payment is pending",
                "ResponseDateTime": "2026-01-14T06:21:42.0330892Z",
                "ResponseTime": 172,
                "AcquirerResponseCode": null,
                "AcquirerResponseDescription": null,
                "EciValue": null,
                "MarketingDescription": "Payment is pending.\nPlease complete your payment through the selected payment channel."
            }
        },
        "aud": "65805a1636c74b8e8ac81a991da80be4",
        "iss": "PacoIssuer",
        "exp": 1768375302,
        "iat": 1768371702,
        "nbf": 1768371702
    }
}
*/
