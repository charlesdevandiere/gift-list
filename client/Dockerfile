FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .
RUN npm run lint -- --quiet
RUN npm run build && rm -rf .angular
