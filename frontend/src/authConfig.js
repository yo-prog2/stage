export const msalConfig = {
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
};

export const loginRequest = {
  scopes: ["User.Read", "Mail.Read"], // Or any API permission your backend needs
};