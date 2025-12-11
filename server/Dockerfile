FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY server/package.json ./server/

RUN yarn install --frozen-lockfile

COPY server/ ./server/

WORKDIR /app/server

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
