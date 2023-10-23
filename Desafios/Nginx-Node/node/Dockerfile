FROM node:18

WORKDIR /usr/src/app

COPY . .

EXPOSE 3000

RUN chmod +x start.sh

ENTRYPOINT [ "./start.sh" ]