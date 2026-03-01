# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dos2unix for line ending conversion
RUN apk add --no-cache dos2unix

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client (dummy URL needed at build time, real one used at runtime)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy the rest of the application
COPY . .

# Fix line endings and make entrypoint executable
RUN dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh

# Expose backend port
EXPOSE 5000

# Start the application
ENTRYPOINT ["./docker-entrypoint.sh"]
