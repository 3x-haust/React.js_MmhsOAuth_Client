FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --silent
COPY . .
RUN yarn build
EXPOSE 2087
CMD ["yarn", "start"]
