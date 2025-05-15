# Multi-stage build for Strongly.AI Meteor 3.2 application

# Build stage
FROM node:22.14.0 as builder

# Set environment variables
ENV METEOR_VERSION=3.2

# Install build dependencies
RUN apt-get update && apt-get install -y \
    curl \
    g++ \
    gcc \
    make \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Meteor
RUN curl https://install.meteor.com/?release=${METEOR_VERSION} | sh

# Create app directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN meteor npm install

# Copy the rest of the application
COPY . .

# Build the Meteor application
RUN meteor build --directory /build --server-only --allow-superuser

# Install production dependencies in the bundle
WORKDIR /build/bundle/programs/server
RUN npm install --production

# Fix permissions for the Meteor shrinkwrap.json due to Meteor 3 bug
RUN chmod a+w shrinkwrap.json

# Runtime stage
FROM node:22.14.0-slim

# Environment variables - these will be overridden by Kubernetes
ENV NODE_ENV=production \
    PORT=3000 \
    MONGO_URL=mongodb://localhost:27017/stronglyai \
    ROOT_URL=http://localhost:3000

# Install only necessary runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group to run the application
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Set working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /build/bundle /app
COPY --chown=nodejs:nodejs private/settings/settings.production.json /app/settings.json

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Set METEOR_SETTINGS from the settings file
RUN METEOR_SETTINGS=$(cat /app/settings.json) && \
    export METEOR_SETTINGS

# Expose the application port
EXPOSE 3000

# Set up a healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Switch to non-root user
USER nodejs

# Start the application
CMD ["node", "main.js"]
