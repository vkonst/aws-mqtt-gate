/*global module, require*/
module.exports = (function() {
    "use strict";

    return {
        customizeAndPromisify: customizeAndPromisify,
        uncustomAndCallback: uncustomAndCallback
    };

    function customizeAndPromisify(event, ctx, cb) {
        ctx.$$custom = {
            config: undefined,
            res: {}
        };
        return Promise.resolve([event, ctx]);
    }

    function uncustomAndCallback(err, [event, ctx, cb]) {
        let res = castResponse(err, ctx);
        log(err, event, ctx, res);
        clean(ctx);
        return cb(null, res);

        function castResponse(err, ctx) {
            let res = ctx.$$custom.res, contentType;

            if (err) {
                res.body = err.message;
            } else if (!res.body) {
                contentType = 'application/json';
                res.body = res.json ? JSON.stringify(res.json) : '{"result":"Ok"}';
            }

            if (!res.headers) res.headers = {};
            res.headers['Content-Type'] = contentType ? contentType : 'text/plain';

            if (!res.statusCode)
                res.statusCode = err ? '400' : '200';

            return res;
        }
        function log(err, event, ctx, res) {
            if (err)
                console.log(err);
            if ( process.env.debug >= 1 ) {
                console.log("Event: ", JSON.stringify(event));
                console.log("Response: ", JSON.stringify(res));
            }
            if ( process.env.debug >= 2 )
                console.log("Context: ", JSON.stringify(ctx));
            if ( process.env.debug >= 3 )
                console.log("Env: ", JSON.stringify(process.env));
        }
        function clean(ctx) { delete ctx.$$custom;}
    }

})();