'use strict';

const DEFAULT_PROFILE = "DEFAULT";

const common = require("oci-common");
const secrets = require("oci-secrets");

/**
 * 
 */
class OciSecret {

    /**
     * 
     * @param {common.AuthenticationDetailsProvider} auth 
     */
    constructor(auth) {

        this.client = new secrets.SecretsClient({ authenticationDetailsProvider: auth });

    }

    /**
     * @param {String} secretId The OCID of the secrect to read
     */
    secret(secretId) {

        return new Promise((resolve, reject) => {

            this.client.getSecretBundle({secretId: secretId})
                  .then(response => {

                      let decoded = Buffer.from(response.secretBundle.secretBundleContent.content, 'base64')
                                          .toString('ascii');

                      resolve(decoded);
                  })
                  .catch(error => {
                      reject(error);
                  });
        });
    }
}

module.exports = {

    /**
     * @param {String} configFilePath The path of OCI configuration file
     * @param {String} configProfile The profile to load from the configuration file
     */
    file: (configFilePath, configProfile) => new OciSecret(
        new common.ConfigFileAuthenticationDetailsProvider(
            configFilePath, configProfile || DEFAULT_PROFILE
        )
    ),
    resource: () => new OciSecret(common.ResourcePrincipalAuthenticationDetailsProvider.builder())
}