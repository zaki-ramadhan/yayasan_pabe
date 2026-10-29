import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

if (
  globalForPrisma.prisma &&
  (!globalForPrisma.prisma.faq ||
    !globalForPrisma.prisma.beneficiary ||
    !globalForPrisma.prisma.activityLog ||
    !globalForPrisma.prisma.galleryItem ||
    !globalForPrisma.prisma.instagramProfile ||
    !globalForPrisma.prisma.instagramPost)
) {
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
