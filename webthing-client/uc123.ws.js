const WebSocket = require('ws');
require('dotenv').config()

// Global variables
const SERVER_FRP_DOMAIN = process.env.SERVER_FRP_DOMAIN
const SERVER_FRP_PORT = process.env.SERVER_FRP_PORT

const DEVICE_COUNT = 15

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
  let port = parseInt(SERVER_FRP_PORT)

  const wsUrl = `ws://${SERVER_FRP_DOMAIN}:${port}`

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
