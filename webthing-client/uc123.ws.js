const WebSocket = require('ws');
const {startRecording, stopRecording} = require('./record-traffic')

// Global variables
const remoteGwHost = process.env.WEBTHING_SERVER_HOST || 'localhost'
const DEVICE_COUNT = 15
const useCase = process.env.USE_CASE || 'undefined-use-USE_CASE=ucX-env-var'
const RECORDING_ENABLED = process.env.RECORDING_ENABLED !== undefined?  (process.env.RECORDING_ENABLED=='1'? true: false): true
const RECORDING_INTERFACE = process.env.RECORDING_INTERFACE || 'lo'
const RECORDING_PORT = process.env.RECORDING_PORT || 8888
let ws = null;


// Declare Webthing WebSocket messages
const REQUEST_ACTION = 'requestAction';
const ACTION_STATUS = 'actionStatus';

const ADD_EVENT_SUBSCRIPTION = 'addEventSubscription';
const EVENT = 'event';

const PROPERTY_STATUS = 'propertyStatus';
const SET_PROPERTY = 'setProperty';

const WEBTHING_CONNECTED = 'connected';


// Helper functions: construct WebSocket message and send them

function setProperty(property, value) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const msg = {
      messageType: SET_PROPERTY,
      data: {[property]: value},
    };

    ws.send(JSON.stringify(msg));
  }
}

function requestAction(details) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const msg = {
      messageType: REQUEST_ACTION,
      data: details,
    };

    ws.send(JSON.stringify(msg));
  }
}
function requestActionForThing(id, details) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const msg = {
      messageType: REQUEST_ACTION,
      id,
      data: details,
    };

    ws.send(JSON.stringify(msg));
  }
}
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let devicesActive = new Set()

// Main demo function

function webThingsDemo() {
  let port = parseInt(process.argv[2]) || 8888
  let intervalSec = parseInt(process.argv[3]) || 60
  const wsUrl = `ws://${remoteGwHost}:${port}`

  for (let i=0;i<DEVICE_COUNT;i++) devicesActive.add(`urn:dev:ops:my-lamp-${i}`)

  // ws = new WebSocket(`${wsUrl}`, 'webthing');
  ws = new WebSocket(`${wsUrl}`);

  ws.on('open', () => {
    console.log(`WebSocket opened at: ${wsUrl}`);

    for (let i=0;i<DEVICE_COUNT;i++) {
      // Subscribe to events
      const msg = {
        id: `urn:dev:ops:my-lamp-${i}`,
        messageType: ADD_EVENT_SUBSCRIPTION,
        data: {
          'overheated': {}
        }
      };
      ws.send(JSON.stringify(msg));
    }

    // delay recording for a bit to be sure subscribe messages went trough
    setTimeout(()=>{
      RECORDING_ENABLED && startRecording(useCase, RECORDING_INTERFACE, RECORDING_PORT)
      setTimeout(()=>{
        RECORDING_ENABLED && stopRecording()

        // end this test
        ws.close()

      // NOTE:  add +1 so we catch all DEVICE_COUNT
      //        also add a bit of time to account for possible network latency
      }, (DEVICE_COUNT +1)*intervalSec*1000 + 20*1000)
    }, 5*1000)
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      switch (msg.messageType) {
        case PROPERTY_STATUS: {
          for (const [name, value] of Object.entries(msg.data)) {
            console.log(`PROPERTY_STATUS: name: ${name} value: ${value} - for thing: ${msg.id}`);
          }
          break;
        }
        case ACTION_STATUS: {
          for (const action of Object.values(msg.data)) {
            console.log(`ACTION_STATUS: action details: ${JSON.stringify(action)}`);
          }
          break;
        }
        case EVENT: {
          for (const [name, event] of Object.entries(msg.data)) {
            console.log(`EVENT: name: ${name} details: ${JSON.stringify(event)} - for thing: ${msg.id}`);
          }
          break;
        }
        case WEBTHING_CONNECTED: {
          if (typeof msg.data === 'boolean' ) {
            if (msg.data) {
              console.log(`WEBTHING_CONNECTED: ${msg.data}; message: ${JSON.stringify(msg)}`);
              devicesActive.add(msg.id)
            }
            else {
              console.log(`WEBTHING_DISCONNECTED: ${msg.data}; message: ${JSON.stringify(msg)}`);
              devicesActive.delete(msg.id)
            }
          }
          break;
        }
        default: {
          console.log(`NEWMSG: UNHANDLED WebSocket message: ${JSON.stringify(msg)}`);
        }
      }
    } catch (e) {
      console.log(`Error receiving websocket message: ${e}`);
    }
  });

  ws.on('close', (code) => {
    console.log('WebSocket closed. Code:', code);
    cleanup()
  });
  ws.on('error', (e) => {
    console.log('WebSocket error', e.message);
    cleanup()
  });
}


// Cleanup util functions

const cleanup = () => {
  ws.removeAllListeners('close');
  ws.removeAllListeners('error');
  ws.close();
  ws = null;
};


// Run main function

webThingsDemo()
