# ---------------------------------------------------------
# Tahap 1: Base Environment (Alpine Linux + Node.js 22)
# ---------------------------------------------------------
FROM node:22-alpine AS base

# Install library pendukung untuk Prisma Query Engine dan manipulasi Sharp
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---------------------------------------------------------
# Tahap 2: Dependencies Cache
# ---------------------------------------------------------
FROM base AS deps

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY prisma ./prisma/
COPY prisma.config.js ./

# Install dependensi secara deterministik & generate Prisma client
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------
# Tahap 3: Builder (Kompilasi Standalone Next.js)
# ---------------------------------------------------------
FROM base AS builder

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Kompilasi aplikasi (menghasilkan folder .next/standalone yang sangat ramping)
RUN pnpm build

# ---------------------------------------------------------
# Tahap 4: Production Runner (Minimal & Aman)
# ---------------------------------------------------------
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Standar OWASP: Gunakan user non-root untuk memitigasi privilege escalation
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Salin berkas statis publik dan hasil bundle standalone Next.js
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.js ./prisma.config.js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Salin dan bersihkan format baris (CRLF -> LF) serta berikan izin eksekusi skrip entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
