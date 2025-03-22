FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# If you're using TypeScript, you need to build it
RUN npm run build

# If your build output is in dist/ folder (typical TypeScript setup)
CMD ["node", "dist/index.js"]

# OR if you're using ts-node to run TypeScript directly
# CMD ["npx", "ts-node", "src/index.ts"]