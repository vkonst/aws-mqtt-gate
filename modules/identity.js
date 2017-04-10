/*global module, require*/
module.exports = (function() {
    "use strict";

    let crypto = require('crypto');
    let ip = require('ip');

    return Identity;

    function Identity(authorizedItems) {
        if (!(this instanceof Identity)) return new Identity(authorizedItems);
        let identity = this;

        const verificationDisabled = true;
        if (authorizedItems === verificationDisabled) {
            identity.verify = () => {return true};
        } else {
            identity.verify = verifyIdentity;
            identity.verifyByMac = verifyByMac;
            identity.verifyByPassw = verifyByPassw;
            identity.verifyByIp = verifyByIp;

            identity.conf = authorizedItems;
            processConf(identity.conf);
        }
        return identity;
    }

    function processConf(conf) {
        try {
            addAllowedUsers(conf);
            addAllowedIpPools(conf);
        } catch (e) {console.error(e);}
    }

    function verifyIdentity(event) {
        let identity = this;
        try {
            if (isVerifiableByMacEvent(event))
                return identity.verifyByMac(event);

            if (isVerifiableByPasswEvent(event))
                return identity.verifyByPassw(event);

            if (isVerifiableByIpEvent(event))
                return identity.verifyByIp(event);
        }
        catch(e) {console.error(e);}
        return false;
    }

    function addAllowedUsers(conf) {
        let users = conf.users;
        if (!users) return;

        conf.allowedUsers = {};
        for (var name in users) {
            let passw = users[name];
            conf.allowedUsers[name] = passw;
        }
    }

    function addAllowedIpPools(conf) {
        let ipPools = conf.ipPools;
        if (!ipPools) return;

        let poolsArr = (Array.isArray(ipPools)) ? ipPools : [ipPools];
        poolsArr.forEach(addIpPool);

        function addIpPool(pool) {
            if (!conf.allowedSubnets) conf.allowedSubnets = [];
            conf.allowedSubnets.push(
                ip.cidrSubnet(pool)
            );
        }
    }

    function isVerifiableByMacEvent(event) {
        return (event.body && getHmacFromEvent(event)) ? true : false;
    }

    function verifyByMac(event) {
        let conf = this.conf;
        if (conf.hmacKey) {
            let expectedHmac = getHmacFromEvent(event);
            let body = parseHmacInBody(event.body).bodyLessHmac;
            let actualHmac = hmacSha1Hash(body, conf.hmacKey);
            return actualHmac === expectedHmac ? true : false;
        } else
            return false;
    }

    function isVerifiableByPasswEvent(event) {
        return getUserPasswFromEvent(event) ? true : false;
    }

    function verifyByPassw(event) {
        let conf = this.conf;
        if (!conf.allowedUsers) return false;

        let user = getUserPasswFromEvent(event);
        let knownPassw = conf.allowedUsers[user.name];
        return knownPassw === user.passw;
    }

    function isVerifiableByIpEvent(event) {
            return getSourceIpFromEvent(event) ? true : false;
    }

    function verifyByIp(event) {
        let conf = this.conf;
        if (!conf.allowedSubnets) return false;

        let clientIp = getSourceIpFromEvent(event);
        return addressIsInSubnets(clientIp, conf.allowedSubnets);
    }

    function getHmacFromEvent(event) {
        let hmac = event.queryStringParameters ?
            event.queryStringParameters["hmac"] : undefined;
        if (!hmac && event.body) {
            hmac = parseHmacInBody(event.body).hmac;
        }
        return hmac;
    }

    function parseHmacInBody(body) {
        const hmacRegex = /^[0-9a-fA-F]{40}/;
        let match = body.match(hmacRegex);
        return {
            hmac: match ? match[0] : undefined,
            bodyLessHmac: match ? body.replace(hmacRegex, '') : body
        };
    }

    function getUserPasswFromEvent(event) {
        let name, passw;
        if (event.queryStringParameters) {
            name = event.queryStringParameters["user"];
            passw = event.queryStringParameters["passw"];
        }
        return (name && passw) ? {name: name, passw: passw} : undefined;
    }

    function getSourceIpFromEvent(event) {
        if(event.requestContext.identity)
            return event.requestContext.identity.sourceIp;
    }

    function addressIsInSubnets(address, subnets) {
        let isInSubnets = false;
        if (subnets) {
            subnets.forEach( (subnet) => {
                if (isInSubnets) return;
                isInSubnets = subnet.contains(address);
            });
        }
        return isInSubnets;
    }

    function hmacSha1Hash(data, key) {
        let hmac = crypto.createHmac('sha1', key).update(data).digest('hex');
        return hmac;
    }
}());