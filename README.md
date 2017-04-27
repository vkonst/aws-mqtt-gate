# aws-mqtt-gate
AWS Lambda function acting as HTTP(s) to MQTT getaway

Initially aimed to route messages from Telegram messenger to a Telegram bot via the AWS IoT (MQTT) broker.
May be used as a "general purpose" getway from HTTP(s) to MQTT.

Use cases:

- Telegram Bot running on a cheep OpenWRT router with GSM connection
- server running behind NAT with slow Internet connection without real IP that listens to commands via MQTT

How it works:

API URL exposed via AWS API gets registered as the Telegram "Webbhook" for your bot.
On receiving a message, the Telegram sends the requests to the "webhook" that AWS routes to this Lambda function.
The Lambda:
- checks identity (see "authorization")
- takes the whole content of the request body as the payload for the MQTT message
- publish the payload to the AWS IoT broker under the topic specified in config.js

How to use:

0. Prerequisites:
- sign up to AWS Lambda, AWS API, AWS IoT
- install node.js and npm (claudia.js and node-lambda.js may be helpful)
- clone the repository
1. Setup HTTP(s) API, register a "thing" with AWS IoT (create and download certificates for the "thing")
2. Update config.js with your settings, upload certificate (if needed)
3. Deploy to AWS Lambda ('npm run-script deploy' may be helpful)

Authorization of requests:

In addition to AWS built-in authorization options (may be difficult to use with external services) this script supports -
- authorization by IP-address of the requesting host
- HMAC code
- URL-encoded user/passw
(refer to "authRules" section in config.js)