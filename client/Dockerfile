# Stage 1: Build the React application
FROM oven/bun:1-alpine as build

WORKDIR /app

# Add ARG for VITE_API_URL
ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=${VITE_API_URL}

# Copy package.json and install dependencies
COPY package.json bun.lock* ./
RUN bun install

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
