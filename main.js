const wpi = require("wiringpi-node");
wpi.setup("wpi");
const mqtt = require("mqtt");
const config = require("loke-config").create("yangpi");
const express = require("express");

let isOk = false;
let mqttConnected = false;

const statusPort = config.get("status_port");
const app = express()
  .use("/", (req, res) => {
    res.status(isOk ? 200 : 500).send();
  })
  .listen(statusPort);

const mqttHost = config.get("mqtt_host");
const client = mqtt.connect("mqtt://" + mqttHost);
let isOpen = false;

client.on("connect", () => {
  console.log("Connected");
  mqttConnected = true;
  updateIsOk();
  client.subscribe("yangpi/trigger");
  client.subscribe("yangpi/open");
  client.subscribe("yangpi/close");
  client.subscribe("yangpi/status");
  client.subscribe("yangpi/google/set");
  client.subscribe("yangpi/ping");
});

client.on("close", () => {
  console.log("Close");
  mqttConnected = false;
  updateIsOk();
});

client.on("offline", () => {
  console.log("Offline");
  mqttConnected = false;
  updateIsOk();
});

function open() {
  if (!isOpen) trigger();
}

function close() {
  if (isOpen) trigger();
}

client.on("message", (topic, message) => {
  console.log("Got message", topic, message.toString());
  switch (topic) {
    case "yangpi/trigger":
      trigger();
      break;
    case "yangpi/open":
      open();
      break;
    case "yangpi/close":
      close();
      break;
    case "yangpi/status":
      isOpen = message.toString() === "true";
      console.log("Garage door is open: " + isOpen);
      // for google assistant mqtt integration
      client.publish("yangpi/google/status", isOpen ? 100 : 0);
      break;
    case "yangpi/google/set":
      const doClose = JSON.parse(message.toString()) === 0;
      console.log("Google open door: " + !doClose);
      if (doClose) {
        close();
      } else {
        open();
      }
      break;
    default:
      break;
  }
});

let onTimeout;
let offTimeout;

function trigger() {
  console.log("Toggling garage door", new Date());
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
