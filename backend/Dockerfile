# =============================================
# Stage 1 — Build
# =============================================
FROM node:22-alpine AS build
WORKDIR /workspace

RUN apk add --no-cache libc6-compat
RUN corepack enable

# Copy workspace info
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json backend/

# Install only backend (dev) deps
RUN pnpm install --frozen-lockfile --filter backend...

# Copy backend source
COPY backend ./backend

# Build Nest app + Prisma client
RUN cd backend && pnpm prisma generate && pnpm build

# Install production dependencies only
RUN pnpm install --prod --filter backend

# =============================================
# Stage 2 — Production (super small)
# =============================================
FROM node:22-alpine AS prod
WORKDIR /app

# Copy prod node_modules + built dist only
COPY --from=build /workspace/backend/node_modules ./backend/node_modules
COPY --from=build /workspace/backend/dist ./backend/dist
COPY --from=build /workspace/backend/prisma ./backend/prisma
COPY --from=build /workspace/backend/package.json ./backend/

# Create logs folder
RUN mkdir -p /app/backend/logs && chown -R node:node /app/backend

USER node
WORKDIR /app/backend

EXPOSE 3000
CMD ["node", "dist/main.js"]
