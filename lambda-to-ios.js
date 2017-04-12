/* global exports, require */
'use strict';

const Identity = require('./modules/identity');
const Publisher = require('./modules/mqttPublisher');
const decryptConfig = require('./modules/decryptConfig');
const getConfig = require('./config');

exports.handler = (event, context, callback) => {
    customize(event, context, callback)
        .then(configure)
        .then(verifySender)
        .then(prepareMsg)
        .then(publishMsg)
        .then(
            () =>  { logCleanReply(null, [event, context]) },
            err => { logCleanReply(err,  [event, context]) }
        );
};

function customize(event, ctx, cb) {
    ctx.$$custom = {callback: cb};
    return Promise.resolve([event, ctx])
}

function configure([event, ctx]) {
    return decryptConfig(getConfig)
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
}

function prepareMsg([event, ctx]) {
    ctx.$$custom.msg = event.body;
}

function publishMsg([event, ctx]) {
    let device = ctx.$$custom.config.device;
    let topic = ctx.$$custom.topic;
    let msg = ctx.$$custom.msg;

    return (new Publisher(device))
        .publish(topic, msg)
        .then(() => { return [event, ctx]; });
}

function logCleanReply(err, [event, ctx]) {
    let msg = ctx.$$custom.res ? ctx.$$custom.res : {"result":"Ok"};
    let res = {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(msg),
        headers: {'Content-Type': (err ? 'application/json' : 'text/plain')}
    };
    log();
    delete ctx.$$custom;
    cb(null, res);

    function log() {
        if (err)
            console.log(err);
        if ( process.env.debug >= 1) {
            console.log("Event: ", JSON.stringify(event));
            console.log("Response: ", JSON.stringify(res));
        }
        if ( process.env.debug >= 2)
            console.log("Context: ", JSON.stringify(ctx));
    }
}
