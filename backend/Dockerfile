FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the API port
EXPOSE 5000

# Start development server
CMD ["npm", "run", "dev"]
