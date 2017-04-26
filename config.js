/* global module, require, process */
module.exports = function(params) {
    "use strict";
    let env = process.env;

    return {
        topic: env.topic ? env.topic : 'fromAwsLambda',
        device: {
            host: params['mqttServer'],
            privateKey: new Buffer(params['privateKey'], "binary"),
            /* alternative:
             keyPath: 'certs/publisher.private.key',
            */
            certPath: 'certs/publisher.pem.cert',
            caPath:   'certs/root-CA.crt',
            clientId: 'lambda-iot-publisher',
            region: 'eu-central-1',
            keepalive: 30,
            protocol: 'mqtts',
            port: 8883,
            delay: 1000,                // in millis before publishing
            debug: false
        },
        /* disabling sender verification:
        authRules: true,
        */
        authRules: {
            hmacKey: params['hmacKey'],
            ipPools: ( (privatePool) => {
                let pools = [
                    "149.154.164.0/22"  // Telegram Messenger Amsterdam Network
                ];
                if (privatePool) pools.push(privatePool);
                return pools;
            } )(params['privatePool']),
            users: undefined            // {"name":"passw"}
        }
    };
};