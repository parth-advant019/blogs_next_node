FROM node:22.12-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (including devDependencies, needed for build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port your app listens on
EXPOSE 5000

# Run the compiled app
CMD ["npm", "start"]