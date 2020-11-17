# oracle-functions-sms
A function for sending SMS through third party integrations.

Currently the only supported provider is [Twilio](https://www.twilio.com).


# Prerequisites
You need a Twilio account for sending SMS, even a [free Twilio account](https://www.twilio.com/try-twilio) can be used.


# Configuration
The function supports the following [configuration variables](https://github.com/fnproject/docs/blob/master/fn/develop/configs.md):

|Variable| Description | Required | Notes |
|--------|-------------|----------|-------|
| `TWILIO_ACCOUNT_SID` | The Twilio account identifier, known as Account Sid | Yes |  |
| `TWILIO_AUTH_TOKEN` | The authorization token for using Twilio API | Only if `TWILIO_AUTH_TOKEN_SECRET_ID` is not specified | Configuration variables are stored in plain text, therefore please consider using `TWILIO_AUTH_TOKEN_SECRET_ID` instead |
| `TWILIO_AUTH_TOKEN_SECRET_ID` | The OCID of the OCI Secret where the Twilio Auth Token is stored |  Only if `TWILIO_AUTH_TOKEN` is not specified | |
| `TWILIO_FROM` | The Twilio phone number to use as sender | Yes | It can be specified as part of the function invocation payload |
| `TWILIO_TO` | The SMS recipient | Yes | It can be specified as part of the function invocation payload |

Please note that [E.164](https://en.wikipedia.org/wiki/E.164) formatting shall be used for phone numbers.


# The function invocation payload
Most of the parameters required for sending a SMS can be set through the config variables, therefore just few information are required to successfully invoke the function..

The function payload is a JSON with the following attributes:

|Name | Description | Notes |
|-----|-------------|-------|
| `text` | The text of the SMS | If not available the current timestamp is used
| `to` | The recipient of the SMS | Required, unless `TWILIO_TO` is available. It takes precedence over `TWILIO_TO`
| `from` | The sender of the SMS | Required, unless `TWILIO_FROM` is available. It takes precedence over `TWILIO_FROM`

Please note that [E.164](https://en.wikipedia.org/wiki/E.164) formatting shall be used for phone numbers.

An example of function's payload is the following:
```json
{
    "text": "Hello there",
    "to": "+447700900415"
}
```

# Deployment
TBD