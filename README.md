# oracle-functions-sms
A function for sending SMS through third party integrations.

Currently the only supported provider is [Twilio](https://www.twilio.com).


# Requirements
You need a Twilio account for sending SMS, even a [free Twilio account](https://www.twilio.com/try-twilio) can be used.
Of course, also an OCI tenant where deploy the function is required.


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

# Running the function


## Prerequisites
1. Configure [your tenant](https://docs.cloud.oracle.com/en-us/iaas/Content/Functions/Tasks/functionsconfiguringtenancies.htm) and your [development environment](https://docs.cloud.oracle.com/en-us/iaas/Content/Functions/Tasks/functionsconfiguringclient.htm) to use Oracle Functions
2. From the Twilio Console:
   - Take note of yours Account Sid and Auth Token, that are required for invoking Twilio API
   - Get your Twilio Phone Number, that’s needed for sending SMS using Twilio API

If you don't have a Twilio Account, you can signup for a [Twilio Free Account](https://www.twilio.com/try-twilio). Due to Twilio trial limitations, you have to [verify a phone number](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account#verify-your-personal-phone-number) before you can send SMS to it.

## Deployment
For deploying the function:
1. Clone the oracle-functions-sms repo
   - `git clone https://github.com/cdivita/oracle-functions-sms.git`
2. Create the application in Oracle Functions
   - `fn create app <app-name> --annotation oracle.com/oci/subnetIds='["<subnet-ocid>"]'`
3. Deploy the function
   - `fn -v deploy --app <app-name> --no-bump`
4. Configure the function
   - `fn config function <app-name> fn-sms TWILIO_ACCOUNT_SID <Your Twilio Account Sid>`
   - `fn config function <app-name> fn-sms TWILIO_AUTH_TOKEN <Your Twilio Auth Token>`
   - `fn config function <app-name> fn-sms TWILIO_FROM <Your Twilio Phone Number>`

If you stored the Twilio Auth Token using [OCI Vault](https://docs.cloud.oracle.com/en-us/iaas/Content/KeyManagement/Tasks/managingsecrets.htm), the configuration activities are slightly different:
1. Use `TWILIO_AUTH_TOKEN_SECRET_ID` rather than `TWILIO_AUTH_TOKEN` as configuration variable
   - `fn config function <app-name> fn-sms TWILIO_AUTH_TOKEN_SECRET_ID <The OCID of your Twilio Auth Token secret>`
2. Create a dynamic group that includes your function resources. A matching rule that can be used is: `all {resource.type = 'fnfunc'}`
3. Create a policy for such dynamic group that allows the access to keys resources
   -  `allow dynamic-group <dynamic-group-name> to read secret-bundles in compartment <keys-compartment>`