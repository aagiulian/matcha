FROM node:10.15.3
WORKDIR /usr/src/app

EXPOSE 4000

COPY package*.json ./
RUN npm install

COPY . .


CMD ["npm", "run", "dev"]