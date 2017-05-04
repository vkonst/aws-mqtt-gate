# aws-mqtt-gate
> AWS Lambda function creating a getaway from HTTP(s) to MQTT 

Initially aimed to route messages from Telegram messenger to a __Telegram bot__ via the __AWS IoT__ broker.
<br/>May be used as a "general purpose" getway from __HTTP(s)__ to __MQTT__.

### Use cases

- Telegram Bot running on a cheep OpenWRT router with poor GSM connection
- Server running behind NAT with slow Internet connection without real IP that listens to commands via MQTT

### How it works

* API URL exposed via __AWS API__ shall be registered as the Telegram __"Webbhook"__ for your bot.
* On receiving a message, the Telegram sends the requests to the "webhook" that AWS routes to this Lambda function.
* This function:
<br/>- checks identity (see `"authorization"`)
<br/>- takes the whole content of the request body as the payload for the MQTT message
<br/>- publishes the payload to the AWS IoT broker under the topic specified in `config.js`

### Authorization of requests

In addition to AWS built-in authorization options (may be difficult to use with external services) this script supports
- authorization by __IP-address__ of the requesting host
- __HMAC code__ in the request params or body
- __User/password__ in the URL
<br/>(refer to `"authRules"` section in `config.js`)

### How to use
0. Prerequisites:
<br/>- sign up to AWS Lambda, AWS API, AWS IoT
<br/>- install node.js and npm (claudia.js and node-lambda.js may be helpful)
<br/>- clone the repository
1. Setup HTTP(s) API, register a "thing" with AWS IoT (create and download certificates for the "thing")
2. Update config.js with your settings, upload certificate (if needed)
3. Deploy to AWS Lambda (`'npm run-script deploy'` may be helpful)
4. Test with `'npm run-script test-aws'`

### Tests
`npm test`

### Licence
ISC 
<br/>`vadim.konstantinov@gmail.com`