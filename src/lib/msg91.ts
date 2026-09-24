/**
 * MSG91 WhatsApp OTP Service
 * Handles sending and resending OTPs via MSG91 WhatsApp channel.
 * Supports:
 *  1. WhatsApp Outbound Template API (Utility / Custom templates created under WhatsApp > Templates)
 *  2. Standard OTP API / Flow API (via MSG91_OTP_TEMPLATE_ID)
 *  3. Graceful simulation mode in local/dev environments.
 */

export interface SendOtpResult {
    success: boolean;
    message?: string;
    error?: string;
    simulated?: boolean;
}

/**
 * Format Indian mobile numbers into international 91XXXXXXXXXX format (digits only).
 */
export function formatWhatsAppMobile(rawMobile: string): string {
    const digits = rawMobile.replace(/\D/g, "");
    if (digits.length === 10) {
        return `91${digits}`;
    }
    if (digits.length === 11 && digits.startsWith("0")) {
        return `91${digits.slice(1)}`;
    }
    if (digits.length === 12 && digits.startsWith("91")) {
        return digits;
    }
    return digits;
}

/**
 * Send 6-digit OTP via MSG91 WhatsApp.
 */
export async function sendWhatsAppOTP(rawMobile: string, otp: string): Promise<SendOtpResult> {
    const cleanMobile = formatWhatsAppMobile(rawMobile);
    const authKey = (process.env.MSG91_AUTHKEY || process.env.MSG91_AUTH_KEY)?.trim();
    
    // 1. WhatsApp Template config (from MSG91 > WhatsApp > Templates)
    const whatsappTemplateName = (process.env.MSG91_WHATSAPP_TEMPLATE_NAME || process.env.MSG91_TEMPLATE_NAME)?.trim();
    const integratedNumber = (process.env.MSG91_INTEGRATED_NUMBER || process.env.MSG91_WHATSAPP_NUMBER)?.trim();
    const langCode = (process.env.MSG91_WHATSAPP_LANG || "en").trim();

    // 2. Fallback: Generic OTP / Flow template ID
    const otpTemplateId = (process.env.MSG91_OTP_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID)?.trim();

    // 0. MSG91 Widget Config (OTP Widget)
    const widgetId = (process.env.MSG91_WIDGET_ID || process.env.NEXT_PUBLIC_MSG91_WIDGET_ID)?.trim();
    const widgetTokenAuth = (process.env.MSG91_WIDGET_TOKEN_AUTH || process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN_AUTH)?.trim();

    const fullMobile = cleanMobile.startsWith("91") && cleanMobile.length === 12 
        ? cleanMobile 
        : (cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile);

    // Mode 0: Send via MSG91 OTP Widget API (WhatsApp configured as Primary Channel)
    if (widgetId && widgetTokenAuth) {
        try {
            console.log(`[MSG91 OTP Widget] Dispatching WhatsApp OTP to +${fullMobile} via Widget ${widgetId}`);
            const widgetEndpoints = [
                "https://control.msg91.com/api/v5/widget/sendOtp",
                "https://api.msg91.com/api/v5/widget/sendOtp"
            ];

            let lastWidgetError = "";
            for (const endpoint of widgetEndpoints) {
                try {
                    const response = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(authKey ? { "authkey": authKey } : {})
                        },
                        body: JSON.stringify({
                            widgetId,
                            tokenAuth: widgetTokenAuth,
                            identifier: fullMobile,
                            otp
                        }),
                        signal: AbortSignal.timeout(7000)
                    });

                    const data = await response.json();
                    console.log(`[MSG91 Widget ${endpoint}] Response:`, data);

                    if (response.ok && (data.type === "success" || data.status === "success" || data.message?.toLowerCase().includes("success") || data.message?.toLowerCase().includes("sent"))) {
                        console.log(`[MSG91 Widget] OTP delivered to +${fullMobile}:`, data.message);
                        return { success: true, message: data.message || "OTP sent successfully via WhatsApp" };
                    }
                    lastWidgetError = data.message || data.errors || "";
                } catch (e: any) {
                    lastWidgetError = e.message;
                }
            }

            if (lastWidgetError) {
                console.warn("[MSG91 Widget Delivery Warning]:", lastWidgetError);
            }
        } catch (wErr: any) {
            console.warn("[MSG91 Widget sendOtp notice]:", wErr.message);
        }
    }

    // Dev / Simulation Mode if credentials or templates are not configured
    const hasWhatsAppTemplateConfig = !!(authKey && whatsappTemplateName && integratedNumber);
    const hasOtpTemplateConfig = !!(authKey && otpTemplateId);

    if (!hasWhatsAppTemplateConfig && !hasOtpTemplateConfig && !widgetId) {
        console.log("=================================================");
        console.log("📱 [MSG91 WHATSAPP SIMULATION / DEV MODE]");
        console.log(`To: +${cleanMobile}`);
        console.log(`WhatsApp OTP: ${otp}`);
        console.log("Configure MSG91_WHATSAPP_TEMPLATE_NAME & MSG91_INTEGRATED_NUMBER in .env for live WhatsApp delivery.");
        console.log("=================================================");
        return {
            success: true,
            simulated: true,
            message: `OTP generated for +${cleanMobile}. (Dev OTP: ${otp})`
        };
    }

    // Mode 1: Send via MSG91 WhatsApp Outbound Template API (Utility / Authentication)
    if (hasWhatsAppTemplateConfig) {
        try {
            console.log(`[MSG91 WhatsApp] Sending via template "${whatsappTemplateName}" from +${integratedNumber} to +${cleanMobile}`);

            const payload = {
                integrated_number: integratedNumber,
                content_type: "template",
                payload: {
                    messaging_product: "whatsapp",
                    type: "template",
                    template: {
                        name: whatsappTemplateName,
                        language: {
                            code: langCode,
                            policy: "deterministic"
                        },
                        to_and_components: [
                            {
                                to: [cleanMobile],
                                components: {
                                    body_1: {
                                        type: "text",
                                        value: otp
                                    }
                                }
                            }
                        ]
                    }
                }
            };

            const response = await fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authkey": authKey!
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(8000)
            });

            const data = await response.json();

            if (response.ok && (data.status === "success" || data.type === "success" || data.message?.toLowerCase().includes("success") || data.message?.toLowerCase().includes("sent"))) {
                console.log(`[MSG91 WhatsApp] Delivered successfully via template to +${cleanMobile}`);
                return { success: true, message: data.message || "OTP sent successfully via WhatsApp" };
            }

            console.error("[MSG91 WhatsApp Template API Error]:", data);

            // Handle MSG91 IP Restriction error 418
            if (data.apiError === "418" || data.code === "401") {
                return {
                    success: false,
                    error: "MSG91 Unauthorized / IP Restricted (Error 418). Please check IP Whitelist in your MSG91 Authkey settings."
                };
            }

            return {
                success: false,
                error: data.message || data.errors || "Failed to deliver WhatsApp message"
            };
        } catch (err: any) {
            console.error("[MSG91 WhatsApp Outbound Exception]:", err);
            return {
                success: false,
                error: err.name === "TimeoutError" ? "MSG91 WhatsApp gateway timed out" : (err.message || "Exception sending WhatsApp template")
            };
        }
    }

    // Mode 2: Send via standard MSG91 Send OTP endpoint
    try {
        const url = new URL("https://control.msg91.com/api/v5/otp");
        url.searchParams.append("template_id", otpTemplateId!);
        url.searchParams.append("mobile", cleanMobile);
        url.searchParams.append("authkey", authKey!);
        url.searchParams.append("otp", otp);
        url.searchParams.append("otp_expiry", "10");

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authkey": authKey!
            },
            body: JSON.stringify({
                template_id: otpTemplateId,
                mobile: cleanMobile,
                otp: otp
            })
        });

        const data = await response.json();

        if (response.ok && (data.type === "success" || data.message?.toLowerCase().includes("success") || data.message?.toLowerCase().includes("sent"))) {
            console.log(`[MSG91 WhatsApp] OTP delivered successfully to +${cleanMobile}`);
            return { success: true, message: data.message || "OTP sent successfully via WhatsApp" };
        }

        console.error("[MSG91 WhatsApp] Error response:", data);
        return {
            success: false,
            error: data.message || "Failed to deliver WhatsApp OTP via MSG91"
        };
    } catch (err: any) {
        console.error("[MSG91 WhatsApp] Network/Request Exception:", err);
        return {
            success: false,
            error: err.message || "Network exception sending WhatsApp OTP"
        };
    }
}

/**
 * Resend / Retry OTP via WhatsApp channel in MSG91.
 */
export async function retryWhatsAppOTP(rawMobile: string, newOtp?: string): Promise<SendOtpResult> {
    const cleanMobile = formatWhatsAppMobile(rawMobile);
    const authKey = (process.env.MSG91_AUTHKEY || process.env.MSG91_AUTH_KEY)?.trim();

    if (!authKey || newOtp) {
        // If we have a new OTP or in dev mode, re-trigger sendWhatsAppOTP
        return sendWhatsAppOTP(rawMobile, newOtp || Math.floor(100000 + Math.random() * 900000).toString());
    }

    try {
        const url = `https://control.msg91.com/api/v5/otp/retry?authkey=${encodeURIComponent(authKey)}&mobile=${encodeURIComponent(cleanMobile)}&retrytype=whatsapp`;
        const response = await fetch(url, {
            method: "GET",
            headers: { "authkey": authKey }
        });
        const data = await response.json();

        if (response.ok && data.type === "success") {
            return { success: true, message: data.message || "OTP resent via WhatsApp" };
        }

        return sendWhatsAppOTP(rawMobile, Math.floor(100000 + Math.random() * 900000).toString());
    } catch (err: any) {
        console.error("[MSG91 WhatsApp Retry] Error:", err);
        return sendWhatsAppOTP(rawMobile, Math.floor(100000 + Math.random() * 900000).toString());
    }
}
