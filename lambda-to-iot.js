/* global exports, require, process */
'use strict';

const myContext = require('./modules/myContext');
const Identity = require('./modules/identity');
const Publisher = require('./modules/mqttPublisher');
const configure = require('./modules/configure');
const getConfig = require('./config');

exports.handler = (event, context, callback) => {
    myContext
        .customizeAndPromisify(event, context, callback)
        .then(processConfig)
        .then(verifySender)
        .then(prepareMsg)
        .then(publishMsg)
        .then(
            () =>  { myContext.uncustomAndCallback(null, [event, context, callback]) },
            err => { myContext.uncustomAndCallback(err,  [event, context, callback]) }
        );
};

function processConfig([event, ctx]) {
    return configure(getConfig)
        .then( config => {
            ctx.$$custom.config = config;
            return [event, ctx];
        });
}

function verifySender([event, ctx]) {
    let authRules = ctx.$$custom.config.authRules;
    const identity = new Identity(authRules);
    if (!identity.verify(event))
        return Promise.reject({message: 'Unauthorized'});
    return [event, ctx];
}

function prepareMsg([event, ctx]) {
    ctx.$$custom.msg = event.body;
    return [event, ctx];
}

function publishMsg([event, ctx]) {
    let device = ctx.$$custom.config.device;
    let topic = ctx.$$custom.config.topic;
    let msg = ctx.$$custom.msg;

    return (new Publisher(device))
        .publish(topic, msg)
        .then(() => { return [event, ctx]; });
}
