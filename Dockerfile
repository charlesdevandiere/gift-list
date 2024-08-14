FROM node:20-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /usr/src/app

RUN chown node:node ./
USER node

COPY ./api/package.json ./api/package-lock.json ./api/
RUN npm install && npm cache clean --force

COPY ./api ./api/

WORKDIR /usr/src/app/api
RUN npx tsc

EXPOSE $PORT

CMD ["node", "./out-tsc/index.js"]
