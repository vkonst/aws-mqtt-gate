/* global module, require, describe, before, after, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const sinon = require('sinon');

const AWS = require('aws-sdk');

let underTest, decryptor, encryptedData, decryptedData, parsedData;

describe('kmsDecryptor.js', ()=>{
    before(() => {
        sinon.stub(AWS, 'KMS').callsFake(mockKmsConstructor);
        underTest = requireUncached('../modules/kmsDecryptor');
        decryptor = underTest;
    });
    after( () => {
        AWS.KMS.restore()} );

    beforeEach(() => {
        encryptedData = "someWirdSequenceOfCharsInBase64Encoding=";
        decryptedData = '{"privateKey":"aLotOfCharsGoHere","hmacKey":"aBitLessHere"}';
        parsedData = JSON.parse(decryptedData);
    });

    describe('"kmsDecryptor" module', function() {
        it('shall export "decryptor" object', function() {
            assert.equal(typeof decryptor, 'object');
        })
    });

    describe('"decryptor" object', function() {
        it('shall have "decrypt" method', function() {
            assert.equal(typeof decryptor.decrypt, 'function');
        })
    });

    describe('"decrypt" method', function() {

        it('shall return a promise', function() {
            let promise = decryptor.decrypt(encryptedData);
            assert.equal(promise instanceof Promise, true);
        });

        it('shall return a promise resolving to "parsedData" object for this test', function(done) {
            decryptor.decrypt(encryptedData)
                .then( (data) => {
                    assert.deepEqual(data, parsedData);
                    done();
                })
                .catch( (err)=>{
                    assert.fail('shall not execute it');
                    done();
                });
        });

        it('shall return a rejecting promise for this test', function(done) {
            decryptor.decrypt(null)
                .then( () => {
                    assert.fail('shall not execute it');
                    done();
                })
                .catch( (error) => {
                    assert.ok(error, 'promise shall be rejected');
                    done();
                });
        });
    });

    function mockKmsConstructor() {
        // decrypt(params: KMS.Types.DecryptRequest, callback?: (err: AWSError, data: KMS.Types.DecryptResponse) => void)
        // interface DecryptRequest { CiphertextBlob: CiphertextType; EncryptionContext?: EncryptionContextType; GrantTokens?: GrantTokenList; }
        // interface DecryptResponse { KeyId?: KeyIdType; Plaintext?: PlaintextType; }
        return {
            decrypt: (data, cb) => {
                let dataToEncrypt = data.CiphertextBlob.toString('base64');
                if ( dataToEncrypt === encryptedData ) {
                    cb(null, { Plaintext: decryptedData});
                } else {
                    cb('test error');
                }
            }
        }
    }

    function requireUncached(module){
        delete require.cache[require.resolve(module)];
        return require(module);
    }
});
