FROM oven/bun:1.3.13-alpine

# Install openssl (required by Prisma on Alpine) with no-cache to keep image lean
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package.json and lockfile first for better layer caching
COPY package.json bun.lock* ./

# Copy prisma schema so postinstall can run successfully
COPY prisma ./prisma/

# Install dependencies (frozen to prevent lockfile drift)
RUN bun install --frozen-lockfile

# Copy the rest of the application source
COPY . .

# Generate Prisma client for the target platform
RUN bunx prisma generate

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "src/index.js"]
