#!/bin/bash

BASEDIR=$(dirname $(realpath "$0"))

rm -rf $BASEDIR/publish

docker build -t gift-list-front:latest -f $BASEDIR/Dockerfile $BASEDIR
docker create --name gift-list-front gift-list-front:latest
docker cp gift-list-front:/usr/src/app/dist/browser $BASEDIR/publish
docker rm gift-list-front
docker image rm gift-list-front:latest
chmod 777 -R $BASEDIR/publish
