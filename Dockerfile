# Use a lightweight Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's code
COPY . .

# Build the app
RUN npm run build

# Expose the app port
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "start:dev"]
