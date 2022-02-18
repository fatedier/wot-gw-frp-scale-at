#!/usr/bin/env sh

/usr/local/bin/npm run $1 &

sleep 3

sed "s/linc-gw-unknown/linc-gw-$(hostname)/g" frpc_template.ini > frpc.ini

frpc -c ./frpc.ini