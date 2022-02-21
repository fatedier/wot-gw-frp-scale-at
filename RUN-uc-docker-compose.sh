#!/usr/bin/env sh

docker-compose -p $1 --env-file "test-$1.env" up