import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZOR_TEST_KEY_ID;
const keySecret = process.env.RAZOR_TEST_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
const accountNumber = process.env.RAZOR_ACCOUNT_NUMBER;

/**
 * Validates required environment variables for Razorpay Payouts
 */
export function failFastValidateConfig() {
    const missing = [];
    if (!keyId) missing.push("RAZOR_TEST_KEY_ID");
    if (!keySecret) missing.push("RAZOR_TEST_KEY_SECRET");
    if (!accountNumber) missing.push("RAZOR_ACCOUNT_NUMBER");

    if (missing.length > 0) {
        const msg = `FATAL: Missing Razorpay configuration variables: ${missing.join(", ")}`;
        console.error(msg);
        if (process.env.NODE_ENV === "production") throw new Error(msg);
    }
}

// Run validation at startup
failFastValidateConfig();

/**
 * Helper to make direct RazorpayX API requests via fetch
 * This is used because the standard 'razorpay' SDK doesn't support Banking (RazorpayX) resources.
 */
async function rzpXRequest(method: string, endpoint: string, data?: any, idempotencyKey?: string) {
    console.log(`[DEBUG:RZPX] Request: ${method} ${endpoint}`);
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const url = `https://api.razorpay.com/v1/${endpoint}`;
    
    const headers: any = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
    };
    
    if (idempotencyKey) {
        headers['X-Payout-Idempotency'] = idempotencyKey;
    }

    const options: any = {
        method,
        headers
    };

    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        console.error(`RazorpayX API Error [${method} ${endpoint}]:`, result);
        throw new Error(result.error?.description || `Razorpay API Error: ${result.error?.reason || 'Request failed'}`);
    }

    return result;
}

/**
 * Fetches the banking balance for the RazorpayX account
 */
export async function fetchBankingBalance(): Promise<number> {
    try {
        const response = await rzpXRequest('GET', 'banking_balances');
        
        // Find the account balance for the config account number
        const account = response.items?.find((item: any) => item.account_number === accountNumber) || response.items?.[0];
        
        if (!account) {
            if (process.env.WEBHOOK_SIMULATION === "true") return 500000;
            return 0;
        }
        
        const realBalance = account.balance / 100;
        if (realBalance === 0 && process.env.WEBHOOK_SIMULATION === "true") return 500000;
        
        return realBalance;
    } catch (error: any) {
        console.error("Error fetching Razorpay balance:", error);
        if (process.env.WEBHOOK_SIMULATION === "true") return 500000;
        return 0;
    }
}

/**
 * Fetches the status of a specific payout
 */
export async function fetchRazorpayPayout(rzpPayoutId: string) {
    try {
        return await rzpXRequest('GET', `payouts/${rzpPayoutId}`);
    } catch (error: any) {
        console.error(`Error fetching payout status for ${rzpPayoutId}:`, error);
        throw error;
    }
}

/**
 * Creates or retrieves a Razorpay Contact for a partner
 */
export async function getOrCreateContact(partner: any) {
    if (partner.razorpayContactId) {
        return partner.razorpayContactId;
    }

    // Simulation Mode: Return mock ID
    if (process.env.WEBHOOK_SIMULATION === "true") {
        console.log(`[SIMULATION] Creating mock contact for partner: ${partner.name}`);
        return `cont_sim_${Math.random().toString(36).substring(7)}`;
    }

    try {
        const contact = await rzpXRequest('POST', 'contacts', {
            name: partner.name,
            email: partner.email || undefined,
            contact: partner.mobile,
            type: "vendor",
            reference_id: partner.id,
        });

        return contact.id;
    } catch (error: any) {
        console.error("Error creating Razorpay contact:", error);
        throw error;
    }
}

/**
 * Creates a Razorpay Fund Account for a partner
 */
export async function getOrCreateFundAccount(contactId: string, partner: any) {
    const hasBankDetails = partner.bankAccount && partner.ifsc;
    const hasUpiDetails = !!partner.upiId;

    if (!hasBankDetails && !hasUpiDetails) {
        throw new Error("Partner has no valid payout details.");
    }

    // Simulation Mode: Return mock Fund Account
    if (process.env.WEBHOOK_SIMULATION === "true") {
        console.log(`[SIMULATION] Creating mock fund account for contact: ${contactId}`);
        return {
            fundAccountId: `fa_sim_${Math.random().toString(36).substring(7)}`,
            method: hasBankDetails ? "BANK_TRANSFER" : "UPI"
        };
    }

    try {
        let accountData: any;
        if (hasBankDetails) {
            accountData = {
                contact_id: contactId,
                account_type: "bank_account",
                bank_account: {
                    name: partner.accountHolderName || partner.name,
                    ifsc: partner.ifsc,
                    account_number: partner.bankAccount,
                }
            };
        } else {
            accountData = {
                contact_id: contactId,
                account_type: "vpa",
                vpa: { address: partner.upiId }
            };
        }

        const fundAccount = await rzpXRequest('POST', 'fund_accounts', accountData);
        return {
            fundAccountId: fundAccount.id,
            method: hasBankDetails ? "BANK_TRANSFER" : "UPI"
        };
    } catch (error: any) {
        console.error("Error creating Razorpay fund account:", error);
        throw error;
    }
}

/**
 * Initiates a Payout via RazorpayX
 */
export async function executeRazorpayPayout({
    fundAccountId,
    amount,
    currency = "INR",
    mode = "IMPS",
    purpose = "payout",
    idempotencyKey,
    method
}: {
    fundAccountId: string,
    amount: number,
    currency?: string,
    mode?: string,
    purpose?: string,
    idempotencyKey: string,
    method: string
}) {
    const amountInPaise = Math.round(amount * 100);

    // Simulation Mode: Return mock Payout Response
    if (process.env.WEBHOOK_SIMULATION === "true") {
        console.log(`[SIMULATION] Executing mock payout for fund account: ${fundAccountId}`);
        return {
            id: `pout_sim_${Math.random().toString(36).substring(7)}`,
            status: "processing",
            amount: amountInPaise,
            currency: "INR",
            reference_id: idempotencyKey
        };
    }

    try {
        const payout = await rzpXRequest('POST', 'payouts', {
            account_number: accountNumber,
            fund_account_id: fundAccountId,
            amount: amountInPaise,
            currency,
            mode: method === "BANK_TRANSFER" ? "IMPS" : "UPI", 
            purpose,
            queue_if_low_balance: true,
            reference_id: idempotencyKey,
        }, idempotencyKey);

        return payout;
    } catch (error: any) {
        console.error("Error executing Razorpay payout:", error);
        throw error;
    }
}

/**
 * Validates Razorpay Webhook signature
 */
export function validateWebhookSignature(rawBody: string, signature: string) {
    if (!webhookSecret) {
        console.warn("WARNING: RAZORPAY_WEBHOOK_SECRET is not set. Skipping validation.");
        return true; 
    }

    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

    return expectedSignature === signature;
}
