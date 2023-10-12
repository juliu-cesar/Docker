FROM node:15

WORKDIR /usr/src/app

RUN  apt-get update

ENTRYPOINT [ "npm", "init", "-y",  ]

EXPOSE 3000

CMD [ "node", "index.js" ]