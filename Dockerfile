FROM node:24-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY .env ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
