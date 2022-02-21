# Use cases for FRP test'n'scale

> See `README.md`s from folders

TODO: write mode documentation

### Actual documentation:

This is a bash history of how to run 12 tests.
3 for each use case to demonstrate how to run multiple instances.
Ran in docker to avoid using root wehn launching tcpdump

```shell
./docker-RUN-ME-FIRST.sh 
docker-compose -f docker-compose-frps.yml up -d
./docker-RUN-uc.sh uc4 uc-test-network-12
./docker-RUN-uc.sh uc4 uc-test-network-11
./docker-RUN-uc.sh uc4 uc-test-network-10
./docker-RUN-uc.sh uc3 uc-test-network-9
./docker-RUN-uc.sh uc3 uc-test-network-8
./docker-RUN-uc.sh uc3 uc-test-network-7
./docker-RUN-uc.sh uc2 uc-test-network-6
./docker-RUN-uc.sh uc2 uc-test-network-5
./docker-RUN-uc.sh uc2 uc-test-network-4
./docker-RUN-uc.sh uc1 uc-test-network-3
./docker-RUN-uc.sh uc1 uc-test-network-2
./docker-RUN-uc.sh uc1 uc-test-network-1
```
### Previous documentation:

for now, launch the server part and then the client part as quickly as possible; ex:
```shell
cd webthing-server
npm run uc2 &
sleep 1
cd -
cd webthing-client
npm run uc2 &
```