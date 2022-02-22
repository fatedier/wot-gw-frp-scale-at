#!/usr/bin/env sh

FRPS_IP=$(getent hosts frps| awk '{ print $1 }')

sed "/$SERVER_FRP_DOMAIN/d" /etc/hosts > /tmp/abc123
cp /tmp/abc123 /etc/hosts

printf "${FRPS_IP}\t${SERVER_FRP_DOMAIN}\n" >> /etc/hosts

# TODO: there should be a wait-for-it script - that waits until $SERVER_FRP_DOMAIN is available
sleep 3

/usr/local/bin/npm run $1