/* global require, describe, beforeEach */
'use strict';

const assert = require('assert');

describe('identity.js', () => {
    let Identity = require('../modules/identity');

    describe('"Identity" module', function() {
        it('shall export constructor function', function() {
            assert.equal(typeof Identity, 'function');
        })
    });

    describe('Constructor function', function() {
        it('shall return "identity" object', function() {
            let identity = new Identity(true);
            assert.equal(typeof identity, 'object');
        });

        it('shall NOT trow exception if called with empty getConfig', function() {
            let identity = new Identity();
            assert(typeof identity, 'object');
        });
    });

    describe('"identity" object', function() {
        it('shall has "verify" method', function() {
            let identity = new Identity(true);
            assert.equal(typeof identity.verify, 'function');
        });
    });

    describe('"identity" object constructed by "Identity(true)" call', function() {
        it('shall has "verify" method that always returns true', function() {
            let identity = new Identity(true);
            assert.equal(identity.verify(null), true);
            assert.equal(identity.verify(undefined), true);
            assert.equal(identity.verify({}), true);
            assert.equal(identity.verify(createEvent({ipAddress: "149.154.164.32"})), true);
        });
    });

    describe('"verify" method', function() {
        let identity;
        beforeEach(() => {
            let authorizedItems = {
                ipPools:[
                    "149.154.164.0/22", // 149.154.164.0 - 149.154.167.255
                    "10.0.0.4/32"
                ],
                users: {
                    'door-sensor': 'tervetuloa',
                    'oracle': 'letitbe'
                },
                hmacKey: 'aBcDeF'
            };
            identity = Identity(authorizedItems);
        });

        it('shall return true for pre-defined getConfig and sourceIp 149.154.164.32 in event.requestContext.identity', function() {
            let event = createEvent({ipAddress: "149.154.164.32"});
            assert.equal(identity.verify(event), true);
        });

        it('shall return true for pre-defined getConfig and sourceIp 149.154.164.0 in event.requestContext.identity', function() {
            assert.equal(identity.verify(createEvent({ipAddress: "149.154.164.0"})), true);
        });

        it('shall return true for pre-defined getConfig and sourceIp 149.154.167.255 in event.requestContext.identity', function() {
            assert.equal(identity.verify(createEvent({ipAddress: "149.154.167.255"})), true);
        });

        it('shall return false for pre-defined getConfig and sourceIp 149.154.168.8 in event.requestContext.identity', function() {
            assert.equal(identity.verify(createEvent({ipAddress: "149.154.168.8"})), false);
        });

        it('shall return true for pre-defined getConfig and sourceIp 10.0.0.4 in event.requestContext.identity', function() {
            assert.equal(identity.verify(createEvent({ipAddress: "10.0.0.4"})), true);
        });

        it('shall return false for pre-defined getConfig and sourceIp 10.0.0.5 in event.requestContext.identity', function() {
            assert.equal(identity.verify(createEvent({ipAddress: "10.0.0.5"})), false);
        });

        it('shall return true for user&passw in event.queryStringParameters matching getConfig.authRules.users', function() {
            let user1 = { name: 'door-sensor', passw: 'tervetuloa' };
            let user2 = { name: 'oracle', passw: 'letitbe' };
            assert.equal(identity.verify(createEvent({user: user1})), true);
            assert.equal(identity.verify(createEvent({user: user2})), true);
        });

        it('shall return false for user&passw in event.queryStringParameters unmatching getConfig.authRules.users', function() {
            let user = { name: 'door-sensor', passw: 'letitbe' };
            assert.equal(identity.verify(createEvent({user: user})), false);
        });

        it('shall return false if user is given but passw is missing in event.queryStringParameters', function() {
            let user = { passw: 'letitbe' };
            assert.equal(identity.verify(createEvent({user: user})), false);
        });

        it('shall return true if event.queryStringParameters.hmac set to HMAC-RSA1 for event.body and getConfig.authRules.hmacKey', function() {
            let event = createEvent({body: '{"message":"some message"}', hmac:'a5f4e0731dce386967d8033ab71fbd9b899b2966'});
            assert.equal(identity.verify(event), true);
        });

        it('shall return false if event.queryStringParameters.hmac set to invalid HMAC-RSA1', function() {
            let event = createEvent({body: '{"message":"some message"}', hmac:'966a5f4e0731dce386967d8033ab71fbd9b899b2'});
            assert.equal(identity.verify(event), false);
        });

        it('shall return true if event.body begins with HMAC-RSA1 for rest of event.body and getConfig.authRules.hmacKey', function() {
            let event = createEvent({body: 'a5f4e0731dce386967d8033ab71fbd9b899b2966{"message":"some message"}'});
            assert.equal(identity.verify(event), true);
        });

        it('shall return false if event.body begins with invalid HMAC-RSA1', function() {
            let event = createEvent({body: '2966e0731dce386967d8033ab71fbd9b899ba5f4{"message":"some message"}'});
            assert.equal(identity.verify(event), false);
        });

    });

    function createEvent(params) {
        let event = {
            requestContext: {},
            queryStringParameters: null,
            pathParameters: null,
            body: null
        };

        if (params.ipAddress) {
            event.requestContext.identity = {sourceIp: params.ipAddress};
        }

        if (params.user) {
            if (!event.queryStringParameters)
                event.queryStringParameters = {};

            event.queryStringParameters.user = params.user.name;
            event.queryStringParameters.passw = params.user.passw;
        }

        if (params.body) {
            event.body = (typeof params.body === 'object') ?
                JSON.stringify(params.body) : params.body;
        }

        if (params.hmac) {
            if (!event.queryStringParameters)
                event.queryStringParameters = {};
            event.queryStringParameters.hmac = params.hmac;
        }

        return event;
    }
});
