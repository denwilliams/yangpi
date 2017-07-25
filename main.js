const wpi = require('wiringpi-node');
wpi.setup('wpi');
const mqtt = require('mqtt');
const config = require('loke-config').create('yangpi');

const mqttHost = config.get('mqtt_host');
const client  = mqtt.connect('mqtt://' + mqttHost);

client.on('connect', function () {
  console.log('Connected');
  client.subscribe('yangpi/trigger');
})

client.on('message', function (topic, message) {
  console.log('Got message', message.toString());
  trigger();
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
