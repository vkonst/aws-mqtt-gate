/*global module, require*/
module.exports = (function() {
    "use strict";

    const AWS = require('aws-sdk');
    const kms = new AWS.KMS();

    return {
        decrypt: decrypt
    };

    function decrypt(encyptedData) {
        return new Promise(function(resolve, reject) {
            kms.decrypt(
                { CiphertextBlob: new Buffer(encyptedData, 'base64') },
                (err, data) => {
                    if (err)
                        return reject(err);
                    else
                        return resolve(data.Plaintext.toString('ascii'));
                }
            )
        }).then(parseJson);
    }

    function parseJson(data) {
        return JSON.parse(data);
    }
}());