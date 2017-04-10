/* global module, require, process */
module.exports = (function() {
    "use strict";
    const awsIot = require('aws-iot-device-sdk');
    return Publisher;

    function Publisher(config) {
        if (!this instanceof Publisher) return new Publisher();

        this.publish = (topic, payload) => {
            return new Promise( (resolve, reject) => {
                const device = awsIot.device(config);
                device.on('connect', publish);
                device.on('error', closeDeviceAndSettlePromise);


                function publish() {
                    if (!payload) payload = '';
                    if (payload.length > 512) payload = payload.substr(0, 512);
                    if (process.env.debug >= 1) console.log("Connected to MQTT broker.");
                    if (process.env.debug >= 2) console.log("Publishing: %s", payload);
                    device.publish(topic, payload, closeDeviceAndSettlePromise);
                }

                function closeDeviceAndSettlePromise(err) {
                    device.end();
                    err ? reject(err) : resolve();
                }
            })
        }
    }
}());
