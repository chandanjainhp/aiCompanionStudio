# Stage 1: Build the React application
FROM oven/bun:1.3.13-alpine AS build

WORKDIR /app

# Add ARG for VITE_API_URL
ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=${VITE_API_URL}

# Copy package.json and install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the built app with Nginx stable
FROM nginx:1.27-alpine

# Remove default nginx config and use ours
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Use a non-root user for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
