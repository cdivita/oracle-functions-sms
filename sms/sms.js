'use strict';

const TwilioProvider = require("./providers-twilio");

module.exports = {

    /**
     * @param {String} accountSid The Twilio Account Sid
     * @param {String} authToken The Twilio Auth Token
     */
    twilio: (accountSid, authToken) => new TwilioProvider(accountSid, authToken)
}