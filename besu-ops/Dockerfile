# syntax=docker/dockerfile:1
FROM node:20-alpine as base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM node:20-alpine as prod
WORKDIR /app
COPY --from=base /app .
EXPOSE 3000
CMD ["npm", "run", "preview"] 