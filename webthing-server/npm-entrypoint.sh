#!/usr/bin/env sh

/usr/local/bin/npm run $1 &

sleep 1

sed "s/linc-gw-unknown/$SERVER_NAME/g" frpc_template.ini > frpc.ini

frpc -c ./frpc.ini