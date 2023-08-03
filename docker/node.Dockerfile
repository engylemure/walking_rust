FROM node:18.17-alpine3.18 as buildbase

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN apk add libpq musl-dev openssl-dev libc6-compat make --no-cache

ENV HOME=/opt/app

COPY node/ /opt/app

WORKDIR $HOME/

ENTRYPOINT ["dockerize", "-template", "./env.tmpl:./app/.env"]

RUN cd app && yarn --freeze-lockfile

CMD ["sh", "./start.sh"]

EXPOSE 80
