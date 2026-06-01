FROM node:24-alpine AS build-server

WORKDIR /app

COPY ./api/package.json ./api/package-lock.json ./
RUN npm clean-install && \
    npm cache clean --force

COPY ./api ./

RUN npm run build && \
    npm run lint

FROM node:24-alpine AS migrations

WORKDIR /app

RUN npm install --ignore-scripts --global prisma@6.19.3 && \
    npm cache clean --force

COPY ./api/prisma ./prisma

CMD ["prisma", "migrate", "deploy"]


FROM node:24-alpine AS build-client

WORKDIR /app

COPY ./client/package.json ./client/package-lock.json ./
RUN npm clean-install && \
    npm cache clean --force

COPY ./client ./

RUN npm run build && \
    npm run lint


FROM node:24-alpine AS app

RUN addgroup --gid 1961 gift-list && \
    adduser --uid 1969 -D -S -g gift-list gift-list && \
    apk --no-cache add curl
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

HEALTHCHECK --interval=15m CMD curl -f http://localhost:3000/api/healthcheck || exit 1
CMD ["node", "--env-file=.env", "./main.js"]
