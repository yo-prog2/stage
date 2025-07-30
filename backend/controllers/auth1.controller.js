const asyncHandler = require("express-async-handler");

const { PublicClientApplication, ConfidentialClientApplication } = require("@azure/msal-node");

const redirectUri = "http://localhost:3000/auth"; //or any redirect uri you set on the azure AD

const scopes = ["https://graph.microsoft.com/Mail.Read"];

const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
  },
};

const pca = new PublicClientApplication(msalConfig);

const ccaConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret,
  },
};

const cca = new ConfidentialClientApplication(ccaConfig);

exports.index = asyncHandler(async (req, res, next) => {
   const tokenRequest = {
    code: req.query.code,
    scopes,
    redirectUri,
    clientSecret: clientSecret,
  };

  pca.acquireTokenByCode(tokenRequest).then((response) => {
    // Store the user-specific access token in the session for future use
    req.session.accessToken = response.accessToken;

// Redirect the user to a profile page or any other secure route
// This time, we are redirecting to the get-access-token route to generate a client token
    res.redirect("/auth/get-access-token"); 
  }).catch((error) => {
    console.log(error);
    res.status(500).send(error);
  });
});

exports.signin = asyncHandler(async (req, res, next) => {
    const authCodeUrlParameters = {
    scopes,
    redirectUri,
  };

  pca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
    res.redirect(response);
  });


});

exports.get_access_token = asyncHandler(async (req, res, next) => {
  try {
    const tokenRequest = {
      scopes,
      clientSecret: clientSecret,
    };

    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    const accessToken = response.accessToken;

    // Store the client-specific access token in the session for future use
    req.session.clientAccessToken = accessToken; // This will now be stored in the session

    res.send("Access token acquired successfully!");
  } catch (error) {
    res.status(500).send(error);
    console.log("Error acquiring access token:", error.message);
  }
});

