FROM node:10.14-alpine

RUN set -xe && \
    apk add --update python build-base && \
    apk add --no-cache bash git openssh curl && \
    bash --version && ssh -V && npm -v && node -v

COPY ./package.json /streamr-ganache/app/package.json
COPY ./package-lock.json /streamr-ganache/package-lock.json

WORKDIR /streamr-ganache/app

RUN npm install && \
    apk del python build-base git && \
    rm -rf /var/cache/apk/*

COPY . .

EXPOSE 8545
ENV EE_URL http://localhost:8081/streamr-core

ENTRYPOINT ["node", "index.js"]


