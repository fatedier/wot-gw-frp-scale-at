#!/usr/bin/env sh

# see docker-RUN-uc.sh for the two paramters

export TEST_UC=$1
export COMPOSE_PROJECT_NAME=$2
docker-compose -f docker-compose-ucX.yml down