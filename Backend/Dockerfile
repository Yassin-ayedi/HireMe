# Backend Dockerfile
FROM node:18

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the backend port (8085)
EXPOSE 8085

# Start the backend
CMD ["npm", "start"]
