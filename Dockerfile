FROM node:23.10.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . 
RUN npx prisma generate
RUN npm run build 
FROM node:23.10.0-alpine
USER node 
WORKDIR /app

# Ensure we have the base Node modules and compiled JS
COPY --from=builder --chown=node:node /app/dist ./dist 
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# 🌟 CRITICAL FIX: Explicitly copy the generated client files and binaries 🌟
# This is usually where the query engine for the runtime environment resides.
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma 

# Note: /app/prisma is not strictly required at runtime, but keeping it for safety
COPY --from=builder --chown=node:node /app/prisma ./prisma 

EXPOSE 3000
CMD ["node", "dist/main.js"]