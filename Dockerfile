FROM node:20-alpine as development
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
#COPY .env.production ./.env
#RUN npm install -g nest@cli
RUN npm install
#RUN npm run build
COPY ./src ./src
CMD ["npm", "run", "start:dev"]

FROM development as builder
WORKDIR /usr/src/app
RUN npm run build
# Clear dependencies and reinstall for production (no devDependencies)
RUN rm -rf node_modules
RUN npm ci --only=production

FROM node:20-alpine as production
RUN apk --no-cache add nodejs ca-certificates
WORKDIR /root/
COPY --from=builder /usr/src/app ./
CMD [ "node", "dist/main" ]