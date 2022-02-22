Use cases for FRP test'n'scale
---

# Introduction

## Terminology 

### Related to Web Of Things specification

* event - generated by a device to signal a detection (of some kind)
* property - set on, or changed by, a device to signal a state change
* action - sent to a device, takes an amount of time to be completed by the device

### Realted to the tests

* direction: `->`: client-to-server
* direction: `<-`: server-to-client

## Short Description of the Use Cases implemented in code

There are 4 use cases that are tested between a `webthing-client` and a `webthing-server`


| UC name | direction | UC traffic             | total number of messages |
|---------|-----------|------------------------|--------------------------|
| uc1     | -         | idle/none              | = 0 messages sent |
| uc2     | <-        | 15 "on" events<br/> 15 "off" events | for "on" 15 * 1<br/> for "off" 15 * 1<br/><br/> = 30 messages sent |
| uc3     | <-        | 15 "on" events<br/> 15 "off" events<br/><br/>  for each event:<br/>14 properties are updated | for "on" 15 * (1 + 14)<br/> for "off" 15 * (1 + 14)<br/><br/> = 450 messages sent |
| uc4     | ->        | 15 actions<br/><br/>  for each action:<br/> 1 property is updated | each action generates 4 messages:<br/> -> requestAction<br/> <- actionStatus - created<br/> <- actionStatus - pending<br/> <- actionStatus - finished<br/><br/>  each property update generates 1 message:<br/> <- propertyStatus<br/><br/>  = 15 * (1 + 1 + 1 + 1  +  1)<br/> = 75 messages sent |

# Running these Use Cases - with Docker

> NOTE: containers do not yet exit when the use case test is done. This would probably be done in the future. For now multiply 15*UC_INTERVAL and then manuall stop/remove containers

> NOTE: `tcpdump` capture files are inside containers, their folder will be mapped to a host volume in the near future.

Have `docker` and `docker-compose` installed

All tests can be ran in parallel

Prepare the docker environment - only run once, or if you've made changes in any of the 3 folders

```shell
./docker-RUN-ME-FIRST.sh 
```

Before running the actual tests, make sure a `frps` is running:

```shell
docker-compose -f docker-compose-frps.yml up -d
```

Example of running all use cases:

```shell
./docker-RUN-uc.sh uc1 linc-gw-1
./docker-RUN-uc.sh uc2 linc-gw-2
./docker-RUN-uc.sh uc3 linc-gw-3
./docker-RUN-uc.sh uc4 linc-gw-4
```

Example of running multiple instances of each use case:

```shell
./docker-RUN-uc.sh uc1 linc-gw-1
./docker-RUN-uc.sh uc2 linc-gw-2
./docker-RUN-uc.sh uc3 linc-gw-3
./docker-RUN-uc.sh uc4 linc-gw-4
./docker-RUN-uc.sh uc1 linc-gw-5
./docker-RUN-uc.sh uc2 linc-gw-6
./docker-RUN-uc.sh uc3 linc-gw-7
./docker-RUN-uc.sh uc4 linc-gw-8
./docker-RUN-uc.sh uc1 linc-gw-9
./docker-RUN-uc.sh uc2 linc-gw-10
./docker-RUN-uc.sh uc3 linc-gw-11
./docker-RUN-uc.sh uc4 linc-gw-12
```

# Running these Use Cases - on local machine

> NOTE: **launch the server part and then the client part as quickly as possible**

## Install dependencies

```shell
cd webthing-server
npm i
npm run build

cd -
cd webthing-client
npm i
```

## See default values and what they do

see comments in `.env` files from `webthing-client` and `webthing-server` folders

## Running Use Cases

Give `tcpdump` execute permissions for the current user:

```shell
sudo groupadd pcap
sudo usermod -a -G pcap $USER
sudo chgrp pcap /usr/sbin/tcpdump
sudo setcap cap_net_raw,cap_net_admin=eip /usr/sbin/tcpdump
```

To resolve subdomains, either have a few entries in `/etc/hosts`:
```
127.0.0.1 frps
127.0.0.1 webthing-server-200.frps
127.0.0.1 webthing-server-300.frps
```
... or use `dnsmasq`'s `dnsmasq.conf` with:
```
address=/frps/127.0.0.1
```

Run Use Case 2 (with some defaults):

```shell
UNIQUE_SUBDOMAIN=webthing-server-200 # should add .frps and add it in /etc/hosts 
USE_CASE=uc2

export RECORDING_FILE_PREFIX=capture-for-$UNIQUE_SUBDOMAIN RECORDING_ENABLED=1 RECORDING_INTERFACE=lo

cd webthing-server
npm run $USE_CASE &
sleep 1
sed "s/linc-gw-unknown/$UNIQUE_SUBDOMAIN/g" frpc_template.ini > frpc-$UNIQUE_SUBDOMAIN.ini
frpc -c frpc-$UNIQUE_SUBDOMAIN.ini
cd -
cd webthing-client
npm run $USE_CASE &
```

To also run Use Case 3 in parallel:

```shell
UNIQUE_SUBDOMAIN=webthing-server-300 # should add .frps and add it in /etc/hosts 
USE_CASE=uc3

export SERVER_PORT=8889 RECORDING_FILE_PREFIX=capture-for-$UNIQUE_SUBDOMAIN RECORDING_ENABLED=1 RECORDING_INTERFACE=lo

cd webthing-server
npm run $USE_CASE &
sleep 1
sed "s/linc-gw-unknown/$UNIQUE_SUBDOMAIN/g" frpc_template.ini > frpc-$UNIQUE_SUBDOMAIN.ini
sed -i "s/8888/$SERVER_PORT/g" frpc-$UNIQUE_SUBDOMAIN.ini
frpc -c frpc-$UNIQUE_SUBDOMAIN.ini
cd -
export SERVER_FRP_PORT=$SERVER_PORT
cd webthing-client
npm run $USE_CASE &
```

To run dozens of tests on local machine make sure `linc-gw-unknown` and `8888` are unique for each `server-client` pair.