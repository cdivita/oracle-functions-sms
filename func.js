// @ts-nocheck
'use strict';

const fdk = require('@fnproject/fdk');
const secrets = require("./secrects/secrets.js");
const sms = require("./sms/sms");

/**
 * Builds a client for accessing to OCI Secrects
 * 
 * @param {Object} config The function config
 * 
 * @return {secrets.OciSecret}
 */
function buildSecrectsClient(config) {

    /*
     * For local testing using fn, you may embed OCI configuration
     * within the function image
     */
    if (config.OCI_CONFIG_PATH) {

        let path = config.OCI_CONFIG_PATH;
        let profile = config.OCI_CONFIG_PROFILE || "DEFAULT";

        return secrets.file(path, profile);
    }

    return secrets.resource();    
}

/**
 * 
 * @param {*} ctx
 */
function configureTwilio(ctx) {

    let accountSid = ctx.config.TWILIO_ACCOUNT_SID;

    if (!accountSid) {
        return Promise.reject(fail(ctx, 500, "The configuration variable TWILIO_ACCOUNT_SID is missing"));
    }

    let authToken = ctx.config.TWILIO_AUTH_TOKEN;
    let authTokenSecretId = ctx.config.TWILIO_AUTH_TOKEN_SECRET_ID;

    if (!authToken && !authTokenSecretId) {
        return Promise.reject(fail(ctx, 500, "Either TWILIO_AUTH_TOKEN or TWILIO_AUTH_TOKEN_SECRET_ID is required as configuration variable"));
    }

    return new Promise((resolve, reject) => {

        if (authToken) {

            console.log("Please store your Twilio Auth Token using OCI Secrects rather than a plain configuration variable");

            resolve(sms.twilio(accountSid, authToken));
        }
        else {

            let secrets = buildSecrectsClient(ctx.config);

            secrets.secret(authTokenSecretId)
                   .then(token => resolve(sms.twilio(accountSid, token)))
                   .catch(error => reject(error));
        }
    });
}

/**
 * 
 * @param {*} ctx 
 * @param {Number} status 
 * @param {String} message 
 */
function fail(ctx, status, message) {

    ctx.httpGateway.statusCode = status;

    console.log(`${message} (status: ${status})`)

    return {status: status, message: message};
}

/**
 * Handling the invocation
 */
fdk.handle(function(input, ctx) {

    let from = ctx.config.TWILIO_FROM || input.from;
    if (!from) {
        return fail(ctx, 400, 'The SMS sender is missing');
    }

    let to = ctx.config.TWILIO_TO || input.to;
    if (!to) {
        return fail(ctx, 400, 'The SMS recipient is missing');
    }

    return configureTwilio(ctx).then(twilio => {

        console.log("Twilio client configuration has been completed");

        let now = new Date();
        let sms = {
            text: input.text || 'Hello there, the current timestamp is ' + now.toISOString(),
            to: to,
            from: from
        };

        return twilio.send(sms);
    })
    .catch(error => {

        return fail(ctx, error.status, error.message);
    });

}, {inputMode: 'json'});