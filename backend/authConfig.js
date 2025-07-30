/**
 * For enhanced security, consider using client certificates instead of secrets.
 * See README-use-certificate.md for more.
 */
const authConfig = {
    auth: {
        authority: process.env.AZURE_AUTHORITY,
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        // clientCertificate: {
        //     thumbprint: "YOUR_CERT_THUMBPRINT",
        //     privateKey: fs.readFileSync('PATH_TO_YOUR_PRIVATE_KEY_FILE'),
        // }
        redirectUri: "http://localhost:4000/redirect",
    },
    system: {
        loggerOptions: {
            loggerCallback: (logLevel, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: 3,
        },
    }
};

module.exports = authConfig;
