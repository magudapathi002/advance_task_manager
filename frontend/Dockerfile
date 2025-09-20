# ---- Stage 1: Build the React App ----
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the production-ready static files
RUN npm run build


# ---- Stage 2: Serve with Nginx ----
FROM nginx:1.27-alpine

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the network
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]