// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    // In Next 16, params is a Promise and must be awaited.
    const { id } = await params;

    try {
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error("GET /api/projects/[id] failed:", error);

        return NextResponse.json(
            { error: "Could not fetch project" },
            { status: 500 },
        );
    }
}