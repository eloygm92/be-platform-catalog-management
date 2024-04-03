FROM node:20-alpine
ARG ENVIRONMENT

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
#COPY .env.production ./.env
#RUN npm install -g nest@cli
RUN npm install
RUN npm run build
CMD ["node", "dist/main"]