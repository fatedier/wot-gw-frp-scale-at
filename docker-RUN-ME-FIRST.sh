#!/usr/bin/env sh

docker network create frps-network

export COMPOSE_PROJECT_NAME=dummy
export TEST_UC=dummy 
docker-compose -f docker-compose-ucX.yml build