import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchBankingBalance } from "@/lib/razorpay";

export const runtime = 'nodejs';

/**
 * GET /api/admin/payouts/balance
 * Returns the current RazorpayX Account Balance
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const balance = await fetchBankingBalance();
        return NextResponse.json({ success: true, balance });

    } catch (error: any) {
        console.error("Balance API Error:", error);
        return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
    }
}
