FROM node:lts-alpine AS build

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:lts-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile && yarn global add vite

COPY --from=build /app/dist ./dist
COPY vite.config.ts ./
COPY tsconfig.json ./

EXPOSE 3000
CMD ["yarn", "start"]