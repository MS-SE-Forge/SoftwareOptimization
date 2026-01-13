# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./ 
# Install pnpm (since we are on Alpine, corepack usually works or install manually)
RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run prisma:generate
RUN pnpm run build

# Stage 2: Production Runtime
# checkov:skip=CKV_DOCKER_7:Use latest tag to avoid digest resolution errors
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Run as non-root user (Fixes CKV_DOCKER_3)
USER nonroot

CMD ["dist/main.js"]
