# Use the official Node.js 20.5.0 image based on Alpine
FROM node:20.5.0-alpine

# Install Redis
RUN apk add --no-cache redis

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Expose both Node.js and Redis ports
EXPOSE 8181

# Start both Node.js app and Redis server in the background
CMD ["sh", "-c", "redis-server --port 6464 & npm start"]