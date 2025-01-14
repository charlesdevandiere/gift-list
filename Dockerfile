FROM node:22-alpine AS build-server

WORKDIR /app

COPY ./api/package.json ./api/package-lock.json ./
RUN npm clean-install && \
    npm cache clean --force

COPY ./api ./

RUN npm run build && \
    npm run lint


FROM node:22-alpine AS build-client

WORKDIR /app

COPY ./client/package.json ./client/package-lock.json ./
RUN npm clean-install && \
    npm cache clean --force

COPY ./client ./

RUN npm run build && \
    npm run lint


FROM node:22-alpine AS app

RUN addgroup --gid 1961 gift-list && adduser --uid 1969 -D -S -g gift-list gift-list
WORKDIR /home/gift-list/app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY ./api/package.json ./api/package-lock.json ./
RUN npm clean-install --omit=dev && \
    npm cache clean --force

COPY ./api/openapi.yaml ./openapi.yaml
COPY --from=build-server /app/out-tsc/ ./
COPY --from=build-client /app/dist/gift-list/browser ./www/

USER gift-list
EXPOSE 3000

CMD ["node", "--env-file=.env", "./main.js"]
