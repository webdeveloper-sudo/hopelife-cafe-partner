import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getKey() {
    // Fallback secret for Zero-Config Netlify demo stability
    const secret = process.env.JWT_SECRET || "hope-cafe-demo-secret-key-77229";
    if (!secret) throw new Error("FATAL: JWT_SECRET environment variable is not set.");
    return new TextEncoder().encode(secret);
}

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
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
    // payload should contain e.g. { role: "ADMIN", id: "admin-1" }
    const session = await encrypt(payload);

    // Set HTTP Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 1 day
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
