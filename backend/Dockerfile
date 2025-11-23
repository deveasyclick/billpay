# =============================================
# Stage 1 — Build
# =============================================
FROM node:22-alpine AS build
WORKDIR /workspace

RUN apk add --no-cache libc6-compat
RUN corepack enable

ENV CI=true
# Copy workspace root files FIRST
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy backend package.json
COPY backend/package.json backend/

# Install backend deps (workspace-aware)
RUN pnpm install --frozen-lockfile --filter backend...

# Copy backend source
COPY backend ./backend

# Build Nest + Prisma
RUN cd backend && pnpm prisma generate && pnpm build

# 🔥 Copy workspace root files again for prod install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Install production deps (correct now)
RUN pnpm install --prod --filter backend

# =============================================
# Stage 2 — Production
# =============================================
FROM node:22-alpine AS prod
WORKDIR /app

# Copy backend build output
COPY --from=build /workspace/backend/dist ./backend/dist
COPY --from=build /workspace/backend/prisma ./backend/prisma
COPY --from=build /workspace/backend/package.json ./backend/

# 👉 Copy BOTH node_modules folders
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/backend/node_modules ./backend/node_modules

# Logs folder
RUN mkdir -p /app/backend/logs && chown -R node:node /app/backend

USER node
WORKDIR /app/backend

EXPOSE 3000
CMD ["node", "dist/main.js"]
