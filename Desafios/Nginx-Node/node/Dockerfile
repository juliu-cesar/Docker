FROM node:18

WORKDIR /usr/src/app

COPY . .

RUN chown -R node:node /usr/src/app

EXPOSE 3000
ENTRYPOINT [ "./start.sh" ]