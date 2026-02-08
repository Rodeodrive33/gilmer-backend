# ---- Gilmer Backend Dockerfile ----
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
