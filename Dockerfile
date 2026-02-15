FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./package.json

USER nestjs

EXPOSE 5005

CMD ["node", "dist/main"]