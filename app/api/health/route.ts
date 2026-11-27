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

export async function POST(request: Request) {
    // 1. Parse the body. Invalid JSON -> 400.
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Request body must be valid JSON" },
            { status: 400 },
        );
    }

    const { title, description, ownerId, dueDate } = (body ?? {}) as Record<
        string,
        unknown
    >;

    // 2. Validate required fields.
    if (typeof title !== "string" || title.trim() === "") {
        return NextResponse.json(
            { error: "title is required" },
            { status: 400 },
        );
    }
    if (typeof description !== "string" || description.trim() === "") {
        return NextResponse.json(
            { error: "description is required" },
            { status: 400 },
        );
    }
    if (typeof ownerId !== "string" || ownerId.trim() === "") {
        return NextResponse.json(
            { error: "ownerId is required" },
            { status: 400 },
        );
    }

    // 3. dueDate is optional, but if present it must be a valid date.
    let parsedDueDate: Date | null = null;
    if (dueDate !== undefined && dueDate !== null) {
        parsedDueDate = new Date(String(dueDate));
        if (Number.isNaN(parsedDueDate.getTime())) {
            return NextResponse.json(
                { error: "dueDate must be a valid date" },
                { status: 400 },
            );
        }
    }

    try {
        // 4. The owner must exist (Project.ownerId is a foreign key).
        const owner = await prisma.user.findUnique({
            where: { id: ownerId },
            select: { id: true },
        });
        if (!owner) {
            return NextResponse.json(
                { error: "ownerId does not match any user" },
                { status: 400 },
            );
        }

        // 5. Create the project and register the owner as a member (OWNER role).
        const project = await prisma.project.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                dueDate: parsedDueDate,
                ownerId,
                members: {
                    create: { userId: ownerId, role: "OWNER" },
                },
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("POST /api/projects failed:", error);

        return NextResponse.json(
            { error: "Could not create project" },
            { status: 500 },
        );
    }
}