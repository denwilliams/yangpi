const wpi = require('wiringpi-node');
wpi.setup('wpi');
const mqtt = require('mqtt');
const config = require('loke-config').create('yangpi');
const express = require('express');

let isOk = false;
let mqttConnected = false;

const statusPort = config.get('status_port');
const app = express()
.use('/', (req, res) => {
  res.status(isOk ? 200 : 500).send();
});

const mqttHost = config.get('mqtt_host');
const client  = mqtt.connect('mqtt://' + mqttHost);

client.on('connect', () => {
  console.log('Connected');
  mqttConnected = true;
  updateIsOk();
  client.subscribe('yangpi/trigger');
  client.subscribe('yangpi/ping');
})

client.on('close', () => {
  console.log('Close');
  mqttConnected = false;
  updateIsOk();
});

client.on('offline', () => {
  console.log('Offline');
  mqttConnected = false;
  updateIsOk();
});

client.on('message', (topic, message) => {
  console.log('Got message', message.toString());
  switch (topic) {
    case 'yangpi/trigger':
      trigger();
      break;
    default:
      break;
  }
})

let onTimeout;
let offTimeout;

function trigger() {
  wpi.pinMode(7, wpi.OUTPUT);
  if (onTimeout) clearTimeout(onTimeout);
  if (offTimeout) clearTimeout(offTimeout);
  setOff();
  onTimeout = setTimeout(setOn, 100);
  offTimeout = setTimeout(setOff, 1500);
}

function setOff() {
  wpi.digitalWrite(7, 1);
  offTimeout = null;
}

function setOn() {
  wpi.digitalWrite(7, 0);
  onTimeout = null;
}

function updateIsOk() {
  isOk = mqttConnected;
}
