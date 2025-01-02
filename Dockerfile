FROM node:22-alpine AS build-server

WORKDIR /app

COPY ./api/package.json ./api/package-lock.json ./
RUN npm clean-install --only=dev && \
    npm cache clean --force

COPY ./api ./

RUN npm run lint && \
    npm run build


FROM node:22-alpine AS build-client

WORKDIR /app

COPY ./client/package.json ./client/package-lock.json ./
RUN npm clean-install && \
    npm cache clean --force

COPY ./client ./

RUN npm run lint && \
    npm run build


FROM node:22-alpine AS app

RUN addgroup giftlist && \
    adduser -D -S -g giftlist giftlist
WORKDIR /home/giftlist/app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY ./api/package.json ./api/package-lock.json ./
RUN npm clean-install --only=prod && \
    npm cache clean --force

COPY ./api/prisma ./prisma
COPY ./api/openapi.yaml ./openapi.yaml
COPY --from=build-server /app/out-tsc/ /home/giftlist/app/
COPY --from=build-client /app/dist/gift-list/browser /home/giftlist/app/

USER giftlist
EXPOSE 3000

CMD ["node", "./main.js", "--env-file=/var/lib/gift-list/.env"]
