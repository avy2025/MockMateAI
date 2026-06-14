FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Start development server, bound to all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
