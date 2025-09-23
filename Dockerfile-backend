ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base

RUN apk update && apk add --no-cache libc6-compat git

# Setup pnpm home and path
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable pnpm via corepack
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /app

# ------------------
# Prune stage
# ------------------
FROM base AS pruner
WORKDIR /app

COPY . .
RUN pnpm dlx turbo prune backend --docker

# ------------------
# Builder stage
# ------------------
FROM base AS builder
WORKDIR /app

# Copy pruned manifests and lockfile
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ ./

# Install ALL deps (dev + prod) for build
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Copy full source
COPY --from=pruner /app/out/full/ ./

# Build target app
RUN pnpm dlx turbo run build --filter=backend...

# After build, prune to prod deps only
RUN pnpm prune --prod --no-optional

# ------------------
# Runtime image
# ------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodegroup \
    && adduser --system --uid 1001 nodeuser

USER nodeuser
ENV NODE_ENV=production

# Copy production node_modules and built dist
COPY --from=builder --chown=nodeuser:nodegroup /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodegroup /app/apps/backend/dist ./apps/backend/dist

EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]
