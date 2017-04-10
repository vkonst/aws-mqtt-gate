/* global process, require, describe, , before, after, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const sinon = require('sinon');

describe('decryptConfig.js', () => {
    let kmsDecryptor;
    let underTest, decryptConfig, encryptedData, decryptedData;

    before( () => {
        kmsDecryptor = requireUncached('../modules/kmsDecryptor');
        sinon.stub(kmsDecryptor, 'decrypt').callsFake(fakeDecrypt);
        underTest = require('../modules/decryptConfig');
        decryptConfig = underTest;
    });
    after( () => {kmsDecryptor.decrypt.restore()} );

    beforeEach( ()=> {
        encryptedData = "someWirdCharSequenceWhichAreEncyptedData=";
        decryptedData = {whatItIs: "a mock getConfig"};
        process.env.encrypted = encryptedData;
    });

    describe('decryptConfigure module', () => {
        it('shall export a function', () => {
            assert.equal(typeof decryptConfig === 'function', true);
        });
    });

    describe('exported function', () => {
        it('shall return a Promise', () => {
            assert.equal(decryptConfig() instanceof Promise, true);
        });
    });

    describe('returned Promise', () => {
        it('shall resolve to passed <object>getConfig if (!process.env.encrypted)', (done) => {
            delete process.env.encrypted;
            let given = decryptedData;
            decryptConfig(given)
                .then( (returned) => {
                    assert.deepEqual(given, returned);
                    done();
                })
                .catch( () => {
                    asert.fail('shall not be executed');
                    done();
                });
        });

        it('shall call kmsDecryptor with process.env.encrypted if it is defined', () => {
            decryptConfig();
            assert.equal(kmsDecryptor.decrypt.calledWith(encryptedData), true);
        });

        it('shall return "decryptedData" object under the test ', (done) => {
            decryptConfig()
                .then( (returned) => {
                    assert.deepEqual(decryptedData, returned);
                    done();
                })
                .catch( ()=>{
                    assert.fail('shall not execute it');
                    done();
                });
        });

        it('shall return a promise resolving to expected getConfig under the test ', (done) => {
            decryptConfig(function getConfig(decrypted) {
                return {
                    decrypted: decryptedData,
                    dependency: decrypted.whatItIs
                };
            })
                .then( (returned) => {
                    assert.deepEqual(returned, {
                        decrypted: decryptedData,
                        dependency: decryptedData.whatItIs
                    });
                    done();
                })
                .catch( ()=>{
                    assert.fail('shall not execute it');
                    done();
                });
        });

        it('shall return a rejected promise under the test ', (done) => {
            decryptConfig(function getConfig(decrypted) {
                throw new Error ('intentionally thrown');
            })
                .then( (returned) => {
                    assert.fail('shall not execute it');
                    done();
                })
                .catch( (err)=>{
                    assert.equal(Boolean(err), true);
                    done();
                });
        });

    });

    function fakeDecrypt(input) {
        if (input === encryptedData)
            return Promise.resolve(decryptedData);
        else
            return Promise.reject('test error');
    }

    function requireUncached(module){
        delete require.cache[require.resolve(module)]
        return require(module)
    }

});
