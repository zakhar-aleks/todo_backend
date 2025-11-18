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
COPY --from=builder --chown=node:node /app/dist ./dist 
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma 
COPY --from=builder --chown=node:node /app/prisma ./prisma 
EXPOSE 3000
CMD ["node", "dist/main.js"]