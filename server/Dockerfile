FROM oven/bun:1-alpine

# Install openssl for Prisma to work on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package.json and bun.lockb/bun.lock to install dependencies
COPY package.json bun.lock* ./

# Install dependencies using bun
RUN bun install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "src/index.js"]
