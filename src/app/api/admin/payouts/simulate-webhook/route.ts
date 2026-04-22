import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = 'nodejs';

/**
 * Dev-only endpoint to simulate Razorpay webhooks
 * Only works if WEBHOOK_SIMULATION=true
 */
export async function POST(req: Request) {
    try {
        if (process.env.WEBHOOK_SIMULATION !== "true") {
            return NextResponse.json({ error: "Simulation mode is disabled." }, { status: 403 });
        }

        const session = await getSession();
        if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
        }

        const body = await req.json();
        const { event, rzpPayoutId, status_description } = body;

        // Construct a mock Razorpay webhook payload
        const mockPayload = {
            event: event || "payout.processed",
            payload: {
                payout: {
                    entity: {
                        id: rzpPayoutId,
                        status: event === "payout.processed" ? "processed" : (event === "payout.failed" ? "failed" : "reversed"),
                        amount: 0, // Not used by our handler for internal lookup
                        status_details: {
                            description: status_description || "Simulated event"
                        }
                    }
                }
            }
        };

        // Forward to the actual webhook handler
        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://hopelife-cafe-partner.vercel.app'}/api/webhooks/razorpay-payout`;
        
        console.log(`[SIMULATION] Forwarding ${event} for ${rzpPayoutId} to ${webhookUrl}`);

        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-razorpay-signature": "SIMULATED_SIGNATURE" // Handler needs to know this is a simulation
            },
            body: JSON.stringify(mockPayload)
        });

        const result = await res.json();
        return NextResponse.json({
            success: res.ok,
            forwardedTo: webhookUrl,
            handlerResponse: result
        });

    } catch (error: any) {
        console.error("Simulation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
