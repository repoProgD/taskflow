// lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Read the PostgreSQL connection string from the environment variables.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

// Configure the PostgreSQL adapter used by Prisma 7.
const adapter = new PrismaPg({ connectionString });

// Extend the global object to store the Prisma instance during development.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Reuse an existing Prisma instance or create a new one.
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ adapter });

// Prevent creating multiple Prisma instances during Next.js hot reloads.
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}