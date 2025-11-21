# =============================
# Stage 1: Build the application
# =============================
FROM node:22-slim AS build
WORKDIR /workspace

# Install OpenSSL and required build deps
RUN apt-get update -y && apt-get install -y openssl

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy backend package.json for dependency resolution
COPY backend/package.json ./backend/

# Install pnpm and dependencies (workspace-aware)
RUN npm install -g pnpm@latest-10 && \
    pnpm install --frozen-lockfile --filter backend...

# Copy backend source code
COPY backend ./backend

# Generate Prisma client
RUN cd backend && pnpm prisma generate

# Build the NestJS application
RUN cd backend && pnpm build

# =============================
# Stage 2: Production image
# =============================
FROM node:22-slim AS prod
WORKDIR /app

# Install OpenSSL for Prisma at runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy workspace files for production install
COPY --from=build /workspace/pnpm-workspace.yaml ./
COPY --from=build /workspace/package.json ./root-package.json
COPY --from=build /workspace/pnpm-lock.yaml ./

# Copy backend package.json
COPY --from=build /workspace/backend/package.json ./backend/

# Install only production dependencies
RUN npm install -g pnpm@latest-10 && \
    pnpm install --frozen-lockfile --filter backend --prod

# Copy build output and Prisma files from the build stage
COPY --from=build /workspace/backend/dist ./backend/dist
COPY --from=build /workspace/backend/prisma ./backend/prisma

# Generate Prisma client in production (this creates node_modules/.prisma)
RUN cd backend && pnpm dlx prisma@6.16.1 generate

# Create billpay group and add node user to it
RUN groupadd -r billpay && \
    usermod -aG billpay node

# Ensure permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Set working directory to backend
WORKDIR /app/backend

EXPOSE 3000
CMD ["node", "dist/main.js"]
