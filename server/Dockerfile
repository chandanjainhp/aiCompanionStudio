FROM node:20-alpine

# Install openssl for Prisma to work on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package.json to install dependencies
COPY package.json ./

# Install dependencies (using npm install since we don't have package-lock.json, bun.lock is handled differently)
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
