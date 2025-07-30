const express = require("express");

const mail_controller = require("../controllers/mail.controller");

const router = express.Router();


// secure routes

router.post(
    '/process',
    mail_controller.processAssetRelatedEmails
);

module.exports = router;
