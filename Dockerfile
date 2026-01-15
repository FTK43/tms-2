# 1 stage - build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2 stage - production
FROM node:20-alpine AS prod
WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT [ "./docker-entrypoint.sh" ]
CMD [ "node", "dist/main" ]