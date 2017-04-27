/* global require, describe, beforeEach */
'use strict';

const assert = require('assert');
const sinon = require('sinon');

describe('myContext.js', () => {
    let MyContext = require('../modules/myContext');
    let myContext;

    beforeEach(() => { myContext = new MyContext(event, ctx, cb) });

    describe('"myContext" module', function () {
        it('shall export "MyContext" constructor function', function () {
            assert.equal(typeof MyContext, 'function');
        })
    });

    describe('"MyContext" constructor function', function () {
        it('shall create "myContext" object', function () {
            let myContext = new MyContext();
            assert.equal(typeof myContext, 'object');
        })
    });

    describe('"myContext" object', function () {
        it('shall has "res" property being object', function () {
            assert.equal(typeof myContext.res, 'object');
        });

        it('shall has "promisify" method', function () {
            assert.equal(typeof myContext.promisify, 'function');
        });

        it('shall has "finalize" method', function () {
            assert.equal(typeof myContext.finalize, 'function');
        });
    });

    describe('"promisify" method', function () {
        it('shall return a promise', function () {
            assert.equal(myContext.promisify() instanceof Promise, true);
        });

        it('shall return a promise resolving to itself', function (done) {
            myContext.promisify()
                .then((self) => {
                    assert.equal(self, myContext);
                    done();
                });
        });
    });

    describe('"finalize" method', function () {
        let unbindReferenceToFinilize;
        beforeEach( () => {
            unbindReferenceToFinilize = myContext.finalize;
            cb.reset();
        });

        it('being called, shall be bind to "myContext" object', function () {
            unbindReferenceToFinilize();
            assert.equal(cb.calledOn(myContext), true);
        });

        it('shall call "callback" function', function () {
            unbindReferenceToFinilize();
            assert.equal(cb.calledOnce, true);
        });

        it('shall "callback" with null err and "ok" response if no argements passed', function () {
            unbindReferenceToFinilize();
            assert.equal(cb.calledWith(null, okResponse), true);
        });

        it('shall "callback" with null err and "error" response if error passed', function () {
            unbindReferenceToFinilize({message: errMsg});
            assert.equal(cb.calledWith(null, errResponse), true);
        });
    });

    const event = {whatItIs: 'mock event'};
    const ctx = {whatItIs: 'mock context'};
    let cb = sinon.spy();

    const okResponse = {
        headers: {'Content-Type': 'application/json'},
        body:  '{"result":"Ok"}',
        statusCode: '200'
    };

    const errMsg = 'mock error message';
    const errResponse = {
        headers: {'Content-Type': 'text/plain'},
        body:  errMsg,
        statusCode: '400'
    };

});

