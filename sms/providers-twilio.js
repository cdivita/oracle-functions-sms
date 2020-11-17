'use strict';

const twilio = require('twilio');

class TwilioProvider {

    constructor(accountSid, authToken) {

        // @ts-ignore
        this.client = new twilio(accountSid, authToken);
    }

    /**
     * 
     * @param {Object} sms 
     * 
     * @returns {Promise<any>}
     */
    send(sms) {

        return new Promise((resolve, reject) => {

            this.client.messages.create({

                body: sms.text,
        
                /* The SMS will be sent to this number */
                to: sms.to,
        
                /* A valid Twilio number for sending SMS */
                from: sms.from
            })
            .then((message) => {
        
                resolve(message);
    
                console.log(`SMS ${message.sid} sent to ${message.to}`);
    
            })
            .catch(error => {
    
                console.log(`Cannot send SMS to ${sms.to}. ${error.message}`);

                reject(error);
            });
        });
    }
}

module.exports = TwilioProvider;