/*global module, require*/
module.exports = (function() {
    "use strict";

    MyContext.prototype.promisify = returnSelfAsResolvedPromise;
    return MyContext;

    function MyContext(event, ctx, cb) {
        let myCtx = this;
        myCtx.event = event;
        myCtx.ctx = ctx;
        myCtx.cb = cb;
        myCtx.config = undefined;
        myCtx.res = {};

        myCtx.finalize = function() { logAndCallCb.apply(myCtx, arguments) };

        return myCtx;
    }

    function returnSelfAsResolvedPromise() {
        let self = this instanceof MyContext ? this : new MyContext(arguments);
        return Promise.resolve(self);
    }

    function logAndCallCb(ctxOrErr) {
        let myCtx = this;
        let isError = ctxOrErr && (ctxOrErr !== myCtx);
        let err = isError ? ctxOrErr : undefined;

        let res = castResponse(err, myCtx);
        log(err, myCtx);
        return myCtx.cb(null, res);

        function castResponse(err, myCtx) {
            let res = myCtx.res, contentType;

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
        function log(err, myCtx) {
            if (err)
                console.log("Error: ", err);
            if ( process.env.debug >= 1 ) {
                console.log("Event: ", JSON.stringify(myCtx.event));
                console.log("Response: ", JSON.stringify(myCtx.res));
            }
            if ( process.env.debug >= 2 )
                console.log("Context: ", JSON.stringify(myCtx.ctx));
            if ( process.env.debug >= 3 )
                console.log("Env: ", JSON.stringify(process.env));
        }
    }

})();