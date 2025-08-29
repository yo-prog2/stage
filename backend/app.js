/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const mongoose = require("mongoose");
const express = require('express');
const session = require('express-session');
//const { WebAppAuthProvider } = require('msal-node-wrapper');

const authConfig = require('./authConfig.js');

const mail_router = require("./routes/mail.routes");
require('dotenv').config();
const cors = require('cors');


async function main() {

    // initialize express
    const app = express();
    app.use(cors({
    origin: 'http://localhost:3000', // frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // if you need cookies/session
}));
    // Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
    // Included because it removes preparatory warnings for Mongoose 7.
    // See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
    mongoose.set("strictQuery", false);
    
    // Define the database URL to connect to.
    const mongoDB = "mongodb://localhost:27017/assetmanagement";
    
    
    mongoose.connect(mongoDB);
    

    /**
     * Using express-session middleware. Be sure to familiarize yourself with available options
     * and set them as desired. Visit: https://www.npmjs.com/package/express-session
     */
    app.use(session({
        secret: 'ENTER_YOUR_SECRET_HERE',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // set this to true on production
        }
    }));

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

  /*  app.set('views', path.join(__dirname, './views'));
    app.set('view engine', 'ejs');

    app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
    app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

    app.use(express.static(path.join(__dirname, './public')));*/

    try {
        // initialize the wrapper
       /* const authProvider = await WebAppAuthProvider.initialize(authConfig);

        // initialize the auth middleware before any route handlers
        app.use(authProvider.authenticate({
            protectAllRoutes: true, // this will force login for all routes if the user is not already
            acquireTokenForResources: {
                "graph.microsoft.com": { // you can specify the resource name as you wish
                    scopes: ["User.Read", "Mail.Read"],
                    routes: ["/profile"] // this will acquire a token for the graph on these routes
                },
            }
        }));
*/
        app.use("/mail",mail_router);

        /**
         * This error handler is needed to catch interaction_required errors thrown by MSAL.
         * Make sure to add it to your middleware chain after all your routers, but before any other 
         * error handlers.
         */
        //app.use(authProvider.interactionErrorHandler());

        return app;
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = main;