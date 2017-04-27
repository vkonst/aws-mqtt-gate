# aws-mqtt-gate
AWS Lambda function acting as HTTP(s) to MQTT getway

Initially aimed to route messages from a Telegram messenger to a Telegram bot via the AWS IoT (MQTT) broker.
May be used as a "general purpose" getway from HTTP(s) to MQTT.

Use cases:
- Telegram Bot running on a cheep OpenWRT router with GSM connection
- server running behind NAT without real IP that listens to a commands via MQTT

How it works:
API URL exposed via AWS API gets registered as the Telegram "Webbhook" for your bot.
On a message received, the Telegram sends the requests to the "webhook" that AWS routes to this Lambda function.
The Lambda:
- check identity (see authorizstion)
- take the whole content of the request' body as the payload for the MQTT message
- publish the payload to the AWS IoT broker under the topic specified in config.js

How to use:
0. Prerequisites:
- sign up to AWS Lambda, AWS API, AWS IoT
- install node.js (optionally: claudia.js)
- clone the repositaory
1. Setup HTTP(s) API, register a "thing" with AWS IoT (create and dowload certificates for the "thing")
2. Update config.js with your settings, upload certificate (if needed)
3. Deploy to AWS Lambda ('claudia.js' and 'npm run-script deploy' may be helpfull)
