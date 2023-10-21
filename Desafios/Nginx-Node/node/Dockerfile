FROM node:18

WORKDIR /usr/src/app

RUN npm init -y && npm install express -y && npm install mysql2 -y

EXPOSE 3000

CMD [ "node", "index.js" ]