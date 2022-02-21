#!/usr/bin/env sh

# $1 - first argument is the Use Case: 'uc[1-4]'
# $2 - second is the network name into which the client and server will run - so they can access each other by (host)name (e.g. 'webthing-server')

export TEST_UC=$1
export COMPOSE_PROJECT_NAME=$2
docker-compose -f docker-compose-ucX.yml up -d