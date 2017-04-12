/* global module, require, process */
module.exports = function(decrypted) {
    "use strict";
    let env = process.env;

    return {
        topic: env.topic ? env.topic : 'fromAwsLambda',
        device: {
            host: decrypted['mqttServer'],
            //keyPath: 'certs/publisher.private.key',
            privateKey: decrypted['privateKey'],
            certPath: 'certs/publisher.pem.cert',
            caPath:   'certs/root-CA.crt',
            clientId: 'lambda-iot-publisher',
            region: env.region ? env.region : 'eu-central-1',
            keepalive: 30,
            protocol: 'mqtts',
            port: 8883,
            delay: 1000,                // in millis before publishing
            debug: false
        },
        authRules: {                    // set to Boolean(true) to disable identity verification
            hmacKey: decrypted['hmacKey'],
            ipPools: ( (privatePool) => {
                let pools = [
                    "149.154.164.0/22"  // Telegram Messenger Amsterdam Network
                ];
                if (privatePool) pools.push(privatePool);
                return pools;
            } )(decrypted['privateIpPool']),
            users: undefined            // {"name":"passw"}
        }
    };
};