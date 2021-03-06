/* global exports, require */
'use strict';

const ThenContext = require('then-lambda');
const Identity = require('./modules/identity');
const Publisher = require('./modules/mqttPublisher');
const configure = require('./modules/configure');
const getConfig = require('./config');

exports.handler = (event, context, callback) => {
    let thenCtx = new ThenContext(event, context, callback);
    thenCtx.promisify()
        .then(processConfig)
        .then(verifySender)
        .then(prepareMsg)
        .then(publishMsg)
        .then(thenCtx.finalize)
        .catch(thenCtx.finalize);
};

function processConfig(myCtx) {
    return configure(getConfig)
        .then( config => {
            myCtx.config = config;
            return myCtx;
        });
}

function verifySender(myCtx) {
    const identity = new Identity(myCtx.config.authRules);
    if (!identity.verify(myCtx.event))
        return Promise.reject({message: 'Unauthorized'});
    return myCtx;
}

function prepareMsg(myCtx) {
    myCtx.msg = myCtx.event.body;
    return myCtx;
}

function publishMsg(myCtx) {
    let device = myCtx.config.device;
    let topic = myCtx.config.topic;
    let msg = myCtx.msg;

    return (new Publisher(device))
        .publish(topic, msg)
        .then(() => { return myCtx });
}
