# http-async-poc

Proof of Concept for a HTTP Async Server

## Install

```
docker run --rm --interactive --tty \
    --user `id -u`:`id -g` \
    --volume `pwd`/projects/handler:/app \
    --workdir /app \
    node:15.10 npm install

docker run --rm --interactive --tty \
    --user `id -u`:`id -g` \
    --volume `pwd`/projects/worker:/app \
    --workdir /app \
    node:15.10 npm install
```

## Usage

```
docker-compose up --detach \
    --scale handler=2 \
    --scale worker=10
```

```
curl --include localhost --header 'Host: handler'
```

## Technologies

* Docker
* Traefik
* RabbitMQ
* Node.js
