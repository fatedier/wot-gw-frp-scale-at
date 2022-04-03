#!/bin/bash

set -ex

for (( ; ; ))
do
   ps aux|grep frp >> $HOME/ps_frp_record.log
   sleep 60s
done

