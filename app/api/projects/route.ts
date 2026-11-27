// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Newest projects first.
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error("GET /api/projects failed:", error);

        return NextResponse.json(
            { error: "Could not fetch projects" },
            { status: 500 },
        );
    }
}