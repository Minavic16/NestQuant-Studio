# syntax=docker/dockerfile:1

##############################################################################
# Desired Homes Interiors — production image
#
# Multi-stage build:
#   1. deps      — install from the lockfile
#   2. builder   — build the Next.js application
#   3. runner    — the smallest possible runtime image
#
# The application needs a persistent filesystem only for `data/store` and
# `public/uploads`; both are mounted as a volume so content survives redeploys
# (ARCHITECTURE.md §17).
##############################################################################

# ---- Base ---------------------------------------------------------------- #
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- Dependencies ------------------------------------------------------- #
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- Builder ------------------------------------------------------------ #
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Telemetry and lint-time noise are not useful inside a build.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_LINT_DURING_BUILD=0
# Emit the self-contained server directory (next.config.ts).
ENV STANDALONE=1

RUN npm run build

# ---- Runner ------------------------------------------------------------- #
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Only the runtime artefacts of the standalone build.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Content and uploads live here; mount a volume at /app/data.
RUN mkdir -p /app/data/store /app/public/uploads && chown -R node:node /app/data /app/public

USER node
EXPOSE 3000

# The image is healthy when the storefront answers.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
