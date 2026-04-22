import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getKey() {
    // Fallback secret for Zero-Config Netlify demo stability
    const secret = process.env.JWT_SECRET || "hope-cafe-demo-secret-key-77229";
    if (!secret) throw new Error("FATAL: JWT_SECRET environment variable is not set.");
    return new TextEncoder().encode(secret);
}

export async function encrypt(payload: any, expiresIn: string | number = "24h") {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(getKey());
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, getKey(), {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (e) {
        return null;
    }
}

export async function login(payload: any) {
    // Super Admin: 24h, others (Partner, Cafe Admin): 3650 days (indefinite)
    const isSuperAdmin = payload.role === "SUPER_ADMIN";
    const expiresIn = isSuperAdmin ? "24h" : "3650d";
    const maxAge = isSuperAdmin ? 24 * 60 * 60 : 3650 * 24 * 60 * 60;

    const session = await encrypt(payload, expiresIn);

    // Set HTTP Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: maxAge,
    });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function getSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    return await decrypt(sessionCookie);
}
