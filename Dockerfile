FROM node:10.14-alpine

RUN set -xe && \
    apk add --update python build-base && \
    apk add --no-cache bash git openssh curl && \
    bash --version && ssh -V && npm -v && node -v

COPY ./package.json /streamr-ganache/app/package.json
COPY ./package-lock.json /streamr-ganache/app/package-lock.json

WORKDIR /streamr-ganache/app

RUN npm ci && \
    apk del python build-base git && \
    rm -rf /var/cache/apk/*

COPY . .

EXPOSE 8545
ENV EE_URL http://localhost:8081/streamr-core
ENV NETWORK_ID 1111

ENTRYPOINT ["node", "index.js"]