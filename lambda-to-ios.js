/* global exports, require, process */
'use strict';

const Identity = require('./modules/identity');
const Publisher = require('./modules/mqttPublisher');
const decryptConfig = require('./modules/decryptConfig');
const getConfig = require('./config');
let config;

exports.handler = (event, ctx, cb) => {
    configure([event, ctx])
        .then(verifySender)
        .then(prepareMessage)
        .then(publishToMqtt)
        .then( () => { end(null, [event, ctx, cb]);} )

        .catch( err => { end(err, [event, ctx, cb]);} );
};

function configure([event, ctx]) {
    let promise = config ? Promise.resolve(config) : decryptConfig(getConfig);
    return promise
        .then( conf => {
            config = conf;
            return [event, ctx];
        });
}

function verifySender([event, ctx]) {
    const identity = new Identity(config.authorized);
    if (!identity.verify(event))
        return Promise.reject({message: 'Unauthorized'});
}

function prepareMessage([event, ctx]) {

}

function publishToMqtt([event, ctx]) {
    var publisher = new Publisher(config.device);
    return publisher
        .publish(config.topic, event._custom.msg)
        .then(() => { return [event, ctx]; });
}

function end(err, [event, ctx, cb]) {
    let msg;
    if (event._custom.response) {

    }
    let msg = event._custom.response ? event._custom.response : {"result":"Ok"};
    let res = {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(msg),
        headers: {'Content-Type': (err ? 'application/json' : 'text/plain')}
    };
    log(err, event, ctx, res);
    cb(null, res);
}

function log(err, event, ctx, res) {
    if (err) console.log(err);

    if ( process.env.debug >= 1) {
        console.log("Event: ", JSON.stringify(event));
        console.log("Response: ", JSON.stringify(res));
    }
    if ( process.env.debug >= 2) {
        console.log("Context: ", JSON.stringify(ctx));
    }
}
