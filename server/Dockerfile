FROM node:20-slim
WORKDIR /usr/app

# Install dependencies and build the project
COPY package.json package-lock.json ./
RUN npm install

# Copy source files
COPY . .

# Compile
RUN npm run build

# Run the web service on container startup
CMD ["node", "src/server.js"]

