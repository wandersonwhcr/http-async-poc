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
