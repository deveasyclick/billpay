# =============================
# Stage 1: Build the application
# =============================
FROM node:22-slim AS build
WORKDIR /app

# Install OpenSSL and required build deps
RUN apt-get update -y && apt-get install -y openssl

# Copy package files first for caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm@latest-10 && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm dlx prisma generate

# Build the NestJS application
RUN pnpm build

# =============================
# Stage 2: Production image
# =============================
FROM node:22-slim AS prod
WORKDIR /app

# Install OpenSSL for Prisma at runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*


# Copy build output and Prisma files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/prisma ./prisma

# Install only prod dependencies
RUN npm install -g pnpm@latest-10 && pnpm install --prod --frozen-lockfile

RUN pnpm dlx prisma generate

# Create non-root user
RUN groupadd -r billpay && usermod -aG billpay node

# Ensure permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/src/main"]
