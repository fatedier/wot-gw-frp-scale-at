const { Action, Event, Property, MultipleThings, Thing, Value, WebThingServer } = require('./lib/webthing');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

// recording config
const RECORDING_ENABLED = process.env.RECORDING_ENABLED
const RECORDING_INTERFACE = process.env.RECORDING_INTERFACE
const RECORDING_PORT = process.env.RECORDING_PORT
const {startRecording, stopRecording} = require('./record-traffic')


// use case config
const UC_INTERVAL = process.env.UC_INTERVAL // in seconds
const UC_NAME = process.env.UC_NAME // usually: 'uc[1-4]'
const UC_PORT = process.env.UC_PORT // usually: 8888
const DEVICE_COUNT = 15


// actual test code

class OverheatedEvent extends Event {
  constructor(thing, data) {
    super(thing, 'overheated', data);
  }
}

class FadeAction extends Action {
  constructor(thing, input) {
    super(uuidv4(), thing, 'fade', input);
  }

  performAction() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.thing.setProperty('brightness', this.input.brightness);
        // this.thing.addEvent(new OverheatedEvent(this.thing, 102));
        resolve();
      }, this.input.duration);
    });
  }
}

function makeThing(customId = 0) {
  const thing = new Thing(
    `urn:dev:ops:my-lamp-${customId}`,
    `My Lamp ${customId}`,
    ['OnOffSwitch', 'Light'],
    'A web connected lamp'
  );

  thing.addProperty(
    new Property(thing, 'on', new Value(false), {
      '@type': 'OnOffProperty',
      title: 'On/Off',
      type: 'boolean',
      description: 'Whether the lamp is turned on',
    })
  );
  thing.addProperty(
    new Property(thing, 'brightness', new Value(50), {
      '@type': 'BrightnessProperty',
      title: 'Brightness',
      type: 'integer',
      description: 'The level of light from 0-100',
      minimum: 0,
      maximum: 100,
      unit: 'percent',
    })
  );

  thing.addAvailableAction(
    'fade',
    {
      title: 'Fade',
      description: 'Fade the lamp to a given level',
      input: {
        type: 'object',
        required: ['brightness', 'duration'],
        properties: {
          brightness: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            unit: 'percent',
          },
          duration: {
            type: 'integer',
            minimum: 1,
            unit: 'milliseconds',
          },
        },
      },
    },
    FadeAction
  );

  thing.addAvailableEvent('overheated', {
    description: 'The lamp has exceeded its safe operating temperature',
    type: 'number',
    unit: 'degree celsius',
  });

  return thing;
}

function runServer() {
  const port = parseInt(UC_PORT)
  const ucInterval = parseInt(UC_INTERVAL)

  let things = []
  for (let i=0; i<15; i++) things.push(makeThing(i))

  const server = new WebThingServer(
    new MultipleThings(things, 'GWdevice'),
    port,
    null, null, null, '/',
    // disableHostValidation:
    true
  );

  // send at regular intervals
  let n = 0
  let myint = setInterval(async () => {
    const index = n % 15
    things[index].addEvent(new OverheatedEvent(things[index], 110+index));
    for (let i=0; i<15; i++){
      if (i !== index) things[i].setProperty('on', true);
    }

    await new Promise(res => setTimeout(res, 45*1000))

    things[index].addEvent(new OverheatedEvent(things[index], 210+index));
    for (let i=0; i<15; i++){
      if (i !== index) things[i].setProperty('on', false);
    }

    n += 1
  }, ucInterval * 1000);
  
  // process.on('SIGINT', () => {
  //   console.log('Caught signal 1')
  //   clearInterval(myint)
  //   console.log('Caught signal 2')

  //   server
  //     .stop()
  //     .then(() => process.exit())
  //     .catch(() => process.exit());
  // });

  server.start()
  .then(()=>{
    // delay recording for a bit to be sure subscribe messages went trough
    setTimeout(()=>{
      const recordingPort = parseInt(RECORDING_PORT)

      RECORDING_ENABLED == '1' && startRecording(UC_NAME, RECORDING_INTERFACE, recordingPort)
      setTimeout(()=>{
        clearInterval(myint)

        RECORDING_ENABLED == '1' && stopRecording()

        // end this test. delay a bit to not record the socket close packets
        setTimeout(()=>{
          server.stop()
        }, 2*1000)

      // NOTE:  add +1 so we catch all DEVICE_COUNT
      //        also add a bit of time to account for possible network latency
      }, (DEVICE_COUNT +1)*ucInterval*1000 + 20*1000)
    }, 5*1000)
  })
  .catch(console.error);
}

runServer();
