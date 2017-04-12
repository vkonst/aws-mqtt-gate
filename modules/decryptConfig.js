/* global module, require */
module.exports = function configure(getConfig) {
    "use strict";

    let config;
    if (config) return Promise.resolve(config);

    const extend = require('util')._extend;
    const decryptor = require('./kmsDecryptor');

    let asyncDecrypt = process.env.encrypted ?
        decryptor.decrypt(process.env.encrypted) :
        Promise.resolve({});

    return asyncDecrypt
        .then( decrypted => {
            if (typeof getConfig === 'function') {
                config = getConfig(decrypted);
            } else {
                config = extend(
                    getConfig ? getConfig : {},
                    decrypted
                );
            }
            return config;
        });
};
