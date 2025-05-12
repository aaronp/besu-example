# Build stage
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build:all

# Production image
FROM node:18
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/server ./server
COPY --from=build /app/besu-scripts ./besu-scripts
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist-server/index.js"] 