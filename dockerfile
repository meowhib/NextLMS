# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install pnpm and dependencies with cache optimization
RUN npm install -g pnpm && \
    pnpm fetch && \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client, run type check and build
RUN pnpm exec prisma generate && \
    pnpm exec tsc --noEmit && \
    pnpm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies and generate Prisma client
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --prod && \
    pnpm exec prisma generate

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
