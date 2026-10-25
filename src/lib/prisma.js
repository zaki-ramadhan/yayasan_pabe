import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis;

if (
  globalForPrisma.prisma &&
  (!globalForPrisma.prisma.faq ||
    !globalForPrisma.prisma.beneficiary ||
    !globalForPrisma.prisma.activityLog)
) {
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
