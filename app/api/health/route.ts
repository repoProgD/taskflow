// app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Simplest possible query: proves the app can reach the database.
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json(
            { status: "ok", database: "connected" },
            { status: 200 },
        );
    } catch (error) {
        // Log the details on the server, but don't expose them in the response.
        console.error("Health check failed:", error);

        return NextResponse.json(
            { status: "error", database: "unreachable" },
            { status: 503 },
        );
    }
}