# Use cases for FRP test'n'scale - the client part

# Installation

```shell
npm install

npm run ucX # where X is 1-4
```

`ucX.ws.js` has these defaults:
* port: 8888
* interval: 60 (seconds)

they can be modified by calling with arguments from `package.json`. example:
```shell
USE_CASE=uc1 node uc123.ws 9999 86400 # port: 9999, interval: 1 day
```

NOTE: that these need to be ran with `root` privileges because a `tcpdump` is spawned in the background to record traffic of `port` 