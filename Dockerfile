# Base image
FROM node:20 AS build

# Create app directory
WORKDIR /app

# Copy package files, scripts, and patches first (needed for postinstall)
COPY package*.json ./
COPY scripts/ ./scripts/
COPY patches/ ./patches/

# Install dependencies (postinstall will auto-patch node_modules)
RUN npm install --legacy-peer-deps --force

# Bundle app source
COPY . .
# Build the project
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]