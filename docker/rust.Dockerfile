FROM rust:1.71.0-alpine3.18 as buildbase

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN apk add libpq libaio libcurl libcrypto3 libgcc libncursesw libssl3 libstdc++ linux-pam zlib zlib-dev pkgconfig zstd-libs musl musl-dev openssl-dev libc6-compat make --no-cache
RUN cargo install systemfd cargo-watch sea-orm-cli

ENV HOME=/opt/app

COPY rust/ /opt/app

WORKDIR $HOME/

ENTRYPOINT ["dockerize", "-template", "./env.tmpl:./app/.env"]

RUN cd app && cargo build --release

CMD ["sh", "./start.sh"]

EXPOSE 80
