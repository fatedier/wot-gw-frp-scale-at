# Use cases for FRP test'n'scale - the server part

# Installation

```shell
npm install
npm run build

UC_TEST=ucX npm run ucX # where X is 1-4
```

defaults: see `.env` file

NOTE: that these need to be ran with `root` privileges because a `tcpdump` is spawned in the background to record traffic on `RECORDING_PORT` 