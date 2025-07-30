export const msalConfig = {
  auth: {
        authority: process.env.REACT_APP_AZURE_AUTHORITY,
        clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
        clientSecret: process.env.REACT_APP_AZURE_CLIENT_SECRET,
        // clientCertificate: {
        //     thumbprint: "YOUR_CERT_THUMBPRINT",
        //     privateKey: fs.readFileSync('PATH_TO_YOUR_PRIVATE_KEY_FILE'),
        // }
        redirectUri: "http://localhost:3000",
    },
};

export const loginRequest = {
  scopes: ["User.Read", "Mail.Read"], // Or any API permission your backend needs
};