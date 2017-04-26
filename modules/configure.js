/* global module, require */
module.exports = function configure(configGetter) {
    "use strict";

    let config, getParamsPromise;
    if (config) return Promise.resolve(config);

    if (process.env.encrypted) {
        const decryptor = require('./kmsDecryptor');
        getParamsPromise = decryptor.decrypt(process.env.encrypted);
    } else {
        getParamsPromise = Promise.resolve(
            process.env.params ? JSON.parse(process.env.params) : {}
        );
    }

    return getParamsPromise
        .then( params => {
            if (typeof configGetter === 'function') {
                config = configGetter(params);
            } else {
                const extend = require('util')._extend;
                config = extend(
                    configGetter ? configGetter : {},
                    params
                );
            }
            return config;
        });
};
