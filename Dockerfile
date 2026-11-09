# Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run
FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
RUN npm prune --production

EXPOSE 3000
CMD ["npm", "start"]
