# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl1.1-compat

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies with cache optimization
RUN pnpm fetch --prod && \
    pnpm install --frozen-lockfile && \
    pnpm exec prisma generate

# Copy source code
COPY . .

# Run type check and build
RUN pnpm exec tsc --noEmit && \
    pnpm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl1.1-compat

# Install pnpm globally
RUN npm install -g pnpm

# Copy necessary files from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Install production dependencies and generate Prisma client
RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
ENV NEXTAUTH_URL=http://localhost:3100
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start"]
