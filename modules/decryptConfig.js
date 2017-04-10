/* global module, require */
module.exports = function configure(getConfig) {
    "use strict";

    const extend = require('util')._extend;
    const decryptor = require('./kmsDecryptor');

    let asyncDecrypt = process.env.encrypted ?
        decryptor.decrypt(process.env.encrypted) :
        Promise.resolve({});

    return asyncDecrypt
        .then( (decrypted) => {
            if (typeof getConfig === 'function')
                return getConfig(decrypted);
            else
                return extend(
                    getConfig ? getConfig : {},
                    decrypted
                );
        });
};
