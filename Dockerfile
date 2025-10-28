# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application
FROM node:20-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/dist .

# Expose the port the app runs on
EXPOSE 3000

# Serve the application
CMD ["serve", "-s", ".", "-l", "3000"]
