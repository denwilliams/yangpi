# yangpi
Yet another Garage Pi

Because everyone needs their own!

This one is triggered via MQTT. Because IoT.

Minimal effort.

## How It Works

Every time it receives an MQTT event it triggers a relay via a GPIO pin.

This relay is wired to both sides of the button on a remote control. Essentially all it does is short connection emulating a button press for 1.4 seconds.

## How I Use It

My home automation sends it MQTT events based of pretty much anything. Mostly I use it off Google Assistant (voice activation).

## Planned Future Changes

Hooking up a reed switch so I can tell whether the garage door is already opened.
